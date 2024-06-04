# Stand-alone Producer & Parser and Source Composition

* The component model provides tools to compose many plugins together, resolving their dependencies to produce one plugin with combined from capabilities.
* With the approach we can compose the parser and the source plugins with an additional buffering plugin to produce a unified plugin that accepts read and parse configuration as input then it reads the data, process them returning results to the host.
* In this scenario, the host must replace the whole producer functionality in the native code, as all processing logic is encapsulated within the plugin.
* The same `wit` API and host implementation can be utilized with stand-alone producers too which can be useful for `MDF` file format.

## Current Prototype:

* For prototyping purposes, a plugin has been provided that reads the source and offers basic buffering functionality. It then calls a method to parse the data after it has been read and buffered..
* After compiling the plugin, it can be composed  with any parser plugin using [WebAssembly Compositions (WAC)](https://github.com/bytecodealliance/wac) CLI tool to produce one producer plugin.
* Composing command: 
```bash, ignore
wac plug --plug {path_to_parser_wasm_file} -o {output_file.wasm} {path_to_source_producer_wasm_file}
```
* On the host side the plugin wrapper provides similar functions like the producer, which is a function to provide stream of parse results.
* Replacing Producer with this Prototype for DLT files results in performance that is about 1.32x than the native one (30% slower).
* The current implementation is just for prototyping purposes here and stills far away from the real-world implementation.

## WIT File:

```wit, ignore
// *** Data Types & Traits Definitions ***
interface parsing { ... }
interface parse-client { ... }
interface sourcing { ... }

interface source-prod-client {
  use sourcing.{source-error};
  use parsing.{};
  use parse-client.{parser};

  // Trait that initialize a parser source, reads and buffers the data,
  // then call parse on them.
  resource source-prod{
    constructor();
    init: func(config-path: string, file-path: string) -> result<_, source-error>;
    read-then-parse: func(len: u64, bytes-read: u64, timestamp: option<u64>) -> result<_, source-error>;
  }
}

// State that the plugin must provide `soruce-prod` implementation in this world
world producer {
  export source-prod-client;
}
```


## Host Implementation:
```rust
// Generate functions and types form `wit` file
wasmtime::component::bindgen!({
    world: "producer",
  ...
});

// State contains elements and resources of wasm runtime
// This is part of wasmtime `Store` and can be accessed form within it.
struct ProducerPluginState {
    pub ctx: WasiCtx,
    pub table: ResourceTable,
    pub queue: VecDeque<ParseResult>,
}

// Implement host functions in `parsing` interface in the `wit` file 
// same as `WasmParser` host
impl parsing::Host for ProducerPluginState {
    fn add(&mut self, item: Result<ParseReturn, Error>) -> () {...};
    fn add_range(...) -> () {...}
}


// Producer Type to use in chipmunk internally, having the source of DLT file as input
// and providing a stream of parsed items as output.
// This can be used with composed parser and source plugin as one plugin. In addition it can be used with 
// stand-alone plugins (like MDF files) that reads from a file parse the results and returns 
// the values using the method provided by the host "add() and add_range()"
pub struct WasmProducer {
    engine: Engine,
    source_prod_component: Component,
    ...
    source_prod_translate: Producer,
    source_prod_res: ResourceAny,
    read_count: u64,
    start: Option<Instant>, // Used for basic benchmarking only
}

impl WasmProducer {
  pub async fn create(file_path: impl AsRef<Path>) -> anyhow::Result<Self> { 
    // Similar initialization like Parser and Source hosts providing IO access to the plugin
  }

  pub async fn read_next(&mut self) -> Option<ParseResultExtern> {
    // Similar to parse function in Parser Host keeping track on the data offset to provide it 
    // to the plugin on the next call.
  }

  // Calls read_next() and map the results, printing benchmarking results when it's done
  async fn read_next_segment(
      &mut self,
  ) -> Option<(usize, MessageStreamItem<PluginParseMessage>)> {
      let Some(parse_result) = self.read_next().await else {
          println!(
              "\x1b[93mmessage producer took : {:?}\x1b[0m",
              self.start.unwrap().elapsed()
          );
          return None;
      };

      match parse_result {
          // used_bytes doesn't match the native code but it isn't used in `run_producer()`
          // anyway and can be skipped in prototyping.
          Ok((used_bytes, Some(m))) => {
              return Some((used_bytes, MessageStreamItem::Item(m)));
          }
          err => {
              unreachable!("Only happy path is implemented. err: {err:?}");
          }
      }
  }

  // create a stream of pairs that contain the count of all consumed bytes and the MessageStreamItem
  // which is used in the chipmunk to replace byte source while prototyping.
  pub fn as_stream_wasm(
      &mut self,
  ) -> impl Stream<Item = (usize, MessageStreamItem<PluginParseMessage>)> + '_ {
        assert!(
            self.start.is_none(),
            "as_stream_wasm() must be called once only"
        );
      self.start = Some(Instant::now());
      stream! {
          while let Some(item) = self.read_next_segment().await {
              yield item;
          }
      }
  }

// Drop on all instances of resources defined by plugins manually as the other hosts
impl Drop for WasmProducer {...}
```

## Plugin (Guest) Implementation:
```rust
// Same as `bindgen!` on the host with similar options
generate!({...});

struct Component;

// Plugin must provide a type that implement source-prod resource as the `wit` file indicates
impl Guest for Component {
  type SourceProd = FileSourceProd;
}

// Export macro validate if the plugin comply the wit contract on compile time generating all the code to bindgen 
export!(Component);

// This struct reads from the given file and construct a parser resource as defined in `wit` file,
// and deliver the data to the host using the function "add() and add_range()" provided by the host.
// When this plugin is composed with the parser plugin it will result with a plugin that has the implementation
// For both of them at the same time.
pub struct FileSourceProd {
  reader: RefCell<Option<BufReader<File>>>,
  parser: Parser,
  last_read_len: Cell<u64>,
}


impl GuestSourceProd for FileSourceProd {
    fn new() -> Self {
        // Create a parser is defined in the `wit` file
        let parser = Parser::new();
        Self {
            reader: Default::default(),
            parser,
            last_read_len: Cell::new(0),
        }
    }

    fn init(&self, _config_path: String, file_path: String) -> Result<(), SourceError> {...}

    // When this function is called from the host, this will read from the file and pass the data to the parser plugin
    // Then the parser plugin will used the method `add() and add_range()` provided by the host to deliver the data 
    // the host directly.
    fn read_then_parse(
        &self,
        len: u64,
        read_len: u64,
        timestamp: Option<u64>,
    ) -> Result<(), SourceError> {
        let mut reader_borrow = self.reader.borrow_mut();
        let reader = reader_borrow
            .as_mut()
            .ok_or_else(|| SourceError::Other("Source is not initialized".into()))?;

        // Very basic data buffering which still has some errors in it.
        let last_read = self.last_read_len.get();
        if last_read > 0 && read_len > 0 {
            let remain = last_read.checked_sub(read_len).unwrap() as i64;

            reader.seek_relative(-remain).map_err(|err| {
                SourceError::Io(format!("Error while seeking in file buffer: {}", err))
            })?;
        }

        // Read from file
        let len = len as usize;

        let mut buf = Vec::with_capacity(len);

        // *** unsafe is used to gain more performance only but it's not necessary ***
        // SAFETY: truncate is called on the buffer after read call with the read amount of bytes.
        unsafe {
            buf.set_len(len);
        }

        let bytes_read = reader
            .read(&mut buf)
            .map_err(|err| SourceError::Io(format!("Error while reading from file: {}", err)))?;

        if bytes_read < len {
            buf.truncate(bytes_read);
        }
        self.last_read_len.set(bytes_read as u64);

        // Call parse on the parser passing the data to it.
        self.parser.parse_res(&buf, timestamp);

        Ok(())
    }
}
```
