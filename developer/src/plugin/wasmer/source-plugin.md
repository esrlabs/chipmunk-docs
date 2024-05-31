# ByteSource Plugin for Files

The source plugin for Files is realized by a `wasi` module in `application/apps/indexer/plugin/source` together with a corresponding host proxy for the `ByteSource` trait in `application/apps/indexer/session/src/plugin`. 

In order to minimize actual calls to the plugin, each data chunk retrieved from the plugin is stored within the proxy, as long there is unconsumed data left.

## ByteSource WASI module

The plugin will read the next chunk of data and return it to the host.

```rust,no_run
// Singleton instance of the ByteSource within the plugin.
lazy_static! {
    static ref SOURCE: Mutex<ByteSource> = ByteSource::default().into();
}

#[repr(C)]
pub struct Response(*mut u8, u32);

#[allow(clippy::missing_safety_doc)]
#[no_mangle]
pub unsafe extern "C" fn message(ptr: *const u8, len: u32) -> Response {
    // Get the instance of our source.
    let mut source = SOURCE.lock().unwrap_or_else(|error| panic("lock", &error.to_string()));

    // Deserialize the request from the module's memory.
    let input = unsafe { std::slice::from_raw_parts(ptr, len.try_into().unwrap()) };
    let request = rkyv::from_bytes(input).unwrap_or_else(|error| panic("from_bytes", &error.to_string()));

    // Process the request.
    let response = match request {
        PluginRpc::Request(ByteSourceRpc::Setup(SourceSettings {
            input_path,
            ..
        })) => {
            print(&format!("init source: {}", input_path));
            // nothing
            PluginRpc::Response(ByteSourceRpc::SetupDone)
        }
        PluginRpc::Request(ByteSourceRpc::Reload(offset)) => {
            // Track consumed data within source.
            source.consume(offset);

            // Reload new data from source.
            match source.reload() {
                Ok(None) => {
                    print("reload eof");
                    PluginRpc::Response(ByteSourceRpc::ReloadResult(
                        ReloadResult::ReloadEof
                    ))
                },
                Ok(Some(reload)) => {
                    let slice = source.current_slice();
                    PluginRpc::Response(ByteSourceRpc::ReloadResult(
                        ReloadResult::ReloadOk(ReloadOutput {
                            newly_loaded_bytes: reload.newly_loaded_bytes,
                            available_bytes: reload.available_bytes,
                            skipped_bytes: 0,
                            bytes: slice.to_vec()
                        }),
                    ))
                },
                ...
            }
        }
        ...
    };

    // Serialize the response to the module's memory.
    let mut output = rkyv::to_bytes::<_, 256>(&response).unwrap_or_else(|error| panic("to_bytes", &error.to_string()));
    let ptr = output.as_mut_ptr();
    let len = output.len();
    mem::forget(output);

    Response(ptr, len as u32)
}
```

## ByteSource Host proxy

The proxy will store the data retrieved from the plugin and returns it to the host as long as unconsumed data is available.

```rust,no_run
impl ByteSourceProxy {
    pub fn new(
        mut proxy: PluginProxy,
        input_path: &Path,
        total_capacity: usize,
        buffer_min: usize,
    ) -> Self {
        // Init plugin with given settings.
        let request: PluginRpc<ByteSourceRpc> =
            PluginRpc::Request(ByteSourceRpc::Setup(SourceSettings {
                input_path: input_path.display().to_string(),
                total_capacity,
                buffer_min,
            }));
        let request_bytes = rkyv::to_bytes::<_, 256>(&request).unwrap();

        match proxy.call(&request_bytes) {
            Ok(response_bytes) => {
                let response: PluginRpc<ByteSourceRpc> = rkyv::from_bytes(&response_bytes).unwrap();
                if let PluginRpc::Response(ByteSourceRpc::SetupDone) = response {
                    // nothing
                }
                ...
            }
            ...
        }

        Self {
            proxy,
            data: vec![], // Current data from plugin.
            offset: 0,
        }
    }
}

#[async_trait]
impl ByteSource for ByteSourceProxy {
    fn consume(&mut self, offset: usize) {
        // Track offset of already consumed data.
        if self.len() >= offset {
            self.offset += offset;
        }
    }

    async fn reload(
        &mut self,
        _filter: Option<&SourceFilter>,
    ) -> Result<Option<ReloadInfo>, SourceError> {
        // As long as we have unconsumed data we do not reload from plugin.
        if self.offset == 0 && !self.data.is_empty() {
            return Ok(Some(ReloadInfo::new(0, self.data.len(), 0, None)));
        }


        // Create request to reload data from plugin.
        let request: PluginRpc<ByteSourceRpc> =
            PluginRpc::Request(ByteSourceRpc::Reload(self.offset));
        let request_bytes = rkyv::to_bytes::<_, 256>(&request).unwrap();

        match self.proxy.call(&request_bytes) {
            Ok(response_bytes) => {
                let response: PluginRpc<ByteSourceRpc> = rkyv::from_bytes(&response_bytes).unwrap();
                if let PluginRpc::Response(ByteSourceRpc::ReloadResult(result)) = response {
                    match result {
                        ReloadResult::ReloadOk(result) => {
                            self.data = result.bytes;
                            self.offset = 0;

                            return Ok(Some(ReloadInfo::new(
                                result.newly_loaded_bytes,
                                result.available_bytes,
                                result.skipped_bytes,
                                None,
                            )));
                        }
                        ...
                    }
                }
                ...
            }
            ...
        }
    }

    fn current_slice(&self) -> &[u8] {
        &self.data[self.offset..]
    }

    fn len(&self) -> usize {
        self.data.len() - self.offset
    }
}

```