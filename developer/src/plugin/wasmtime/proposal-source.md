# Source

* Current implementation covers the read part of the Byte-Source only, having the plugin to provide the method `read()` returning an array of bytes only.
* Acting as a wrapper, the host implements the read trait and is provided as an argument to the native `BinaryByteSource` Struct.
* With this simple approach it's possible to achieve a near-native performance with the plugin being only 2% slower than native. This is primarily due to all buffering being handled within the native part.

## WIT File

```wit, ignore
interface sourcing {
  // *** Data Types ***
  variant source-error {...}
}

interface source-client {
  use sourcing.{source-error};

  // Client trait definition 
  resource byte-source{
    constructor();
    init: func(config-path: string, file-path: string) -> result<_, source-error>;
    read: func(len: u64) -> result<list<u8>, source-error>;
  }
}

// State that the plugin must provide source implementation in this world.
world source {
  export source-client;
}
```


## Host Implementation:
```rust
wasmtime::component::bindgen!({
    world: "source",
  ...
});

// ByteSource Type to use in chipmunk with `BinaryByteSource` internally, implementing `Read` trait.
// It initializes the runtime and communicate with plugin and call read on it,
// returning bytes buffer when `read()` is called within `BinaryByteSource` 
pub struct WasmByteSource {
    engine: Engine,
    ...
    source_translate: Source,
    source_res: ResourceAny,
}

impl WasmByteSource {
    pub async fn create(
        file_path: impl AsRef<Path>,
        config_path: impl AsRef<Path>,
    ) -> anyhow::Result<Self> {
    // Similar initialization to `WasmParser`
    // ...

    let dir_path_in_plugin = "./files";
    let ctx = WasiCtxBuilder::new()
        .inherit_stdin()
        .inherit_stdout()
        .inherit_stderr()
        // Host can configure which path is allowed in the plugin with their permissions  
        // with the option to provide a different path than the real one.
        .preopened_dir(path_dir, dir_path_in_plugin, DirPerms::READ, FilePerms::READ)?
        .build();

    // Similar initialization to `WasmParser`
    // ...

    let (source_translate, _instance) =
        Source::instantiate_async(&mut store, &component, &linker).await?;

    // create byte source instance
    let source_res = source_translate
        .interface0
        .byte_source()
        .call_constructor(&mut store)
        .await?;

    // File path in plugin world
    let file_path_guest = PathBuf::from(dir_path_in_plugin).join(file_name);

    // Initialize the source plugin with the file path and its configuration file path. 
    source_translate
        .interface0
        .byte_source()
        .call_init(
            &mut store,
            source_res,
            &config_path.as_ref().to_string_lossy(),
            &file_path_guest.to_string_lossy(),
        )
        .await;

    // Rest of initialization ...
  }
}

// Read implementation so we can use it with `BinaryByteSource` from chipmunk
impl Read for WasmByteSource {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        let len = buf.len();
        let resultes =
            futures::executor::block_on(self.source_translate.interface0.byte_source().call_read(
                &mut self.store,
                self.source_res,
                len as u64,
            ));

        match resultes {
            Ok(Ok(bytes)) => {
                let bytes_len = bytes.len();
                buf[..bytes_len].copy_from_slice(&bytes);

                Ok(bytes_len)
            }
            Ok(Err(err)) => Err(io::Error::new(io::ErrorKind::Other, err)),
            Err(err) => Err(io::Error::new(io::ErrorKind::Other, err)),
        }
    }
}

// It's required to call drop on all instances of resources defined by plugins manually
impl Drop for WasmByteSource {
    fn drop(&mut self) {
        if let Err(err) = self.source_translate.resource_drop(&mut self.store)
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

// Plugin must provide a type that implement byte-source resource as the `wit` file indicate
impl Guest for Component {
    type ByteSource = FileSource;
}

// Export macro validate if the plugin comply the wit contract on compile time generating all the code to bindgen 
export!(Component);


pub struct FileSource {
    // Functions defined on source have an immutable reference to self, 
    // therefore we need to wrap the fields with Cells or Mutexes
    reader: RefCell<Option<BufReader<File>>>,
}

// Implement the function as provided by the `wit` file.
impl GuestByteSource for FileSource {
    fn new() -> Self {
        Self::default()
    }

    fn init(&self, _config_path: String, file_path: String) -> Result<(), SourceError> {
        let file = File::open(file_path).map_err(|err| SourceError::Io(err.to_string()))?;
        *self.reader.borrow_mut() = Some(BufReader::new(file));
        Ok(())
    }

    // Method to provide bytes array to the host with the given length.
    fn read(&self, len: u64) -> Result<Vec<u8>, SourceError> {
        let len = len as usize;
        let mut buf = Vec::with_capacity(len);
        // *** unsafe is used to gain more performance only but it's not necessary ***
        // SAFETY: truncate is called on the buffer after read call with the read amount of bytes.
        // Even with unwind after panic, this shouldn't cause undefined behavior since the vector has only bytes which
        // don't have a special drop implementation.
        unsafe {
            buf.set_len(len);
        }

        let mut reader_borrow = self.reader.borrow_mut();
        let reader = reader_borrow
            .as_mut()
            .ok_or_else(|| SourceError::Other("Source is not initialized".into()))?;

        let bytes_read = reader
            .read(&mut buf)
            .map_err(|err| SourceError::Io(format!("Error while reading from file: {}", err)))?;

        if bytes_read < len {
            buf.truncate(bytes_read);
        }

        Ok(buf)
    }
}

```
