# Parser

* Data types for transfer are define in `parsing` interface within the `wit` file, alongside functions provided by the host to retrieve parse results.
* The resource `parser` is encapsulated within `parse-client` interface, providing methods for creation, configuration provisioning, and parse invocation.
* The host serves as a wrapper over the plugin, implementing the parser trait to integrate with the host while abstracting plugin details
* Parse calls process the entire given bytes buffer, returning a list of parse results, which will be cached on the host for internal system integration.
* Changing the parser signature to return an iterator of results would improve the code. 
* DLT-Parser as plugin provided performance that is about 1.35x compared to the native (plugin is 33% slower than native). File size: 500 MB, native: 10.3 Seconds, Plugin: 13.6 seconds.
* An alternative parser is implemented that keeps track on the current memory state so avoid unnecessary data copying, providing one result per call. However, it had worse performance due to the overhead of repeated plugin function calls on each `parse()` call. 

## WIT file:
```wit, ignore

interface parsing {
  // *** Data types ***
  record parse-return {
    value: option<parse-yield>,
    cursor: u64,
  }

  record attachment {...}

  variant parse-yield {
    message(string),
    attachment(attachment),
    message-and-attachment(tuple<string, attachment>),
  }

  variant error {...}

  // Host functions that can be called from the plugin to provide the result
  add: func(item: result<parse-return, error>);
  add-range: func(items: list<result<parse-return, error>>);
}

interface parse-client {
  use parsing.{error, parse-return};

  // Parser trait definitions
  resource parser {
    // Create and initialize the plugin, giving it the path for its configurations
    constructor();
    init: func(config-path: stirng) -> result<_,error>;

    // *** Parse functions *** 
    // Returns all the results as list to the host without using host methods
    parse: func(data: list<u8>, timestamp: option<u64>) -> list<result<parse-return, error>>;

    // Use host methods to return the results (Save memory allocation for results list on plugin)
    parse-res: func(data: list<u8>, timestamp: option<u64>);
  }
}

// State that the plugin must provide parser implementation in this world.
world parse {
  export parse-client;
}

```

## Host Implementation:
```rust

// This macro generate all types and functions from wit file
// It has many argument to configure the parsing
wasmtime::component::bindgen!({
    world: "parse",
    ownership: Borrowing {
        duplicate_if_necessary: false
    },
    async: {
        only_imports: [],
    },
});

// State contains elements and resources of wasm runtime
// This is part of wasmtime `Store` and can be accessed form within it.
struct HostParserState {
    pub ctx: WasiCtx,
    pub table: ResourceTable,
    pub queue: VecDeque<ParseResult>,
}

// Here we are providing the implementation of host functions in `parsing` interface
impl parsing::Host for HostParserState {
    fn add(&mut self, item: Result<ParseReturn, Error>) -> () {
        self.queue.push_back(item);
    }

    fn add_range(
        &mut self,
        items: wasmtime::component::__internal::Vec<Result<ParseReturn, Error>>,
    ) -> () {
        assert!(self.queue.is_empty());
        self.queue = items.into();
    }
}

// Parser Type to use in chipmunk internally, implementing `Parser` trait.
// It initializes the runtime and communicate with plugin and cache the results,
// returning them when `parse()` on parser trait is called 
pub struct WasmParser {
    engine: Engine,
    component: Component,
    linker: Linker<HostParserState>,
    store: Store<HostParserState>,
    parse_translate: Parse,
    parser_res: ResourceAny,
}


impl WasmParser {
    pub async fn create(
        _config_path: impl AsRef<Path>,
    ) -> anyhow::Result<Self> {
        let mut wasm_path = {...};

        // Configuration for wasm runtime
        let mut config = Config::new();
        config.wasm_component_model(true);
        config.async_support(true);

        let engine = Engine::new(&config)?;

        let component = Component::from_file(&engine, wasm_path)?;

        // Linker is responsible of validating the plugin and link functions between host and plugins.
        let mut linker = Linker::new(&engine);
        wasmtime_wasi::add_to_linker_async(&mut linker)?;
        self::host::indexer::parsing::add_to_linker(&mut linker, |state| state);

        let ctx = WasiCtxBuilder::new()
            .inherit_stdin() // plugins can inherit stdio from host
            .inherit_stderr()
            .stdout(wasmtime_wasi::stdout()) // Host can provide custom stdio for the plugins 
            .build();

        let mut store = Store::new(&engine, HostParserState::new(ctx, ResourceTable::new()));

        // Linking and validation for the whole file happens here.
        let (parse_translate, _instance) =
            Parse::instantiate_async(&mut store, &component, &linker).await?;

        // Create parser instance which is defined in the plugin.
        let parser_res = parse_translate
            .interface0
            .parser()
            .call_constructor(&mut store)
            .await?;

        Ok(Self {
            engine,
            component,
            linker,
            store,
            parse_translate,
            parser_res,
        })
    }
  }
}

impl Parser<PluginParseMessage> for WasmParser {
    fn parse<'a>(
        &mut self,
        input: &'a [u8],
        timestamp: Option<u64>,
    ) -> Result<(&'a [u8], Option<parsers::ParseYield<PluginParseMessage>>), parsers::Error> {
        // Get parse cache form the store
        let queue = &mut self.store.data_mut().queue;
        let raw_res = match queue.pop_front() {
            // If the cache is empty or we got an error we send the current slice to parse it. 
            // This would be optimized to reduce calls to wasm and with providing more error types.
            None | Some(Err(Error::Parse(_))) | Some(Err(Error::Incomplete)) => {
                futures::executor::block_on(
                    self.parse_translate.interface0.parser().call_parse_res(
                        &mut self.store,
                        self.parser_res,
                        input,
                        timestamp,
                    ),
                )
                .map_err(|err| {
                    println!("Early Error: {err}");
                    parsers::Error::Parse(err.to_string())
                })?;
                return self.parse(input, timestamp);
            }
            Some(res) => res,
        };

        // Map results to chipmunk types and return remain slice depending on data cursor offset
        match raw_res {
            Ok(val) => {
                let remain = &input[val.cursor as usize..];
                let yld = val.value.map(|y| y.into_parsers_yield());

                Ok((remain, yld))
            }
            Err(err) => {
                Err(err.into_parsers_err())
            }
        }

    }
}

// It's required to call drop on all instances of resources defined by plugins manually
impl Drop for WasmParser {
    fn drop(&mut self) {
        if let Err(err) = self.parser_res.resource_drop(&mut self.store)
        {
            log::error!("Error while dropping resources: {err}");
        }
    }
}

```

## Plugin (Guest) Implementation:
```rust
// Same as `bindgen!` on the host with similar options
generate!({...});


struct Component;

// Plugin must provide a type that implement parser resource as the `wit` file indicate
impl Guest for Component {
    type Parser = DltParser;
}

// Export macro validate if the plugin comply the wit contract on compile time generating all the code to bindgen 
export!(Component);


impl GuestParser for DltParser {
    // Constructor called on the host
    fn new() -> Self {
        Self { ... }
    }

    // Function will be called on the host side as well.
    fn parse_res(&self, data: Vec<u8>, timestamp: Option<u64>) {
        // Add function provided by the host. 
        use crate::host::indexer::parsing::add;

        let mut slice = &data[0..];
        loop {
            match Self::parse_intern(...) {
                Ok(res) => {
                    // Update data slice with offset form results
                    slice = &slice[res.cursor as usize..];
                    // Add results directly to the host using the provided `add()` function
                    add(Ok(&res));
                }
                Err(err) => {
                    // Break parsing on errors since errors here indicate that remaining data can't be parsed.
                    add(Err(&err));
                    return;
                }
            }
        }
    }
}

```
