# Parser Plugin for Dlt

The parser plugin for DLT is realized by a `wasm` module in `application/apps/indexer/plugin/dlt` together with a corresponding host proxy for the `Parser` trait in `application/apps/indexer/session/src/plugin`. 

In order to minimize actual calls to the plugin, each data chunk provided to the proxy is being processed in a bulk operation within the plugin.

## DltParser WASM module

The plugin will parse a given chunk of data and return all results to the host.

```rust,no_run
// Singleton instance of the DltParser within the plugin.
lazy_static! {
    static ref PARSER: Mutex<DltParser<'static>> = DltParser::default().into();
}

#[repr(C)]
pub struct Response(*mut u8, u32);

#[allow(clippy::missing_safety_doc)]
#[no_mangle]
pub unsafe extern "C" fn message(ptr: *const u8, len: u32) -> Response {
    // Get the instance of our parser.
    let mut parser = PARSER.lock().unwrap_or_else(|error| panic("lock", &error.to_string()));

    // Deserialize the request from the module's memory.
    let input = unsafe { std::slice::from_raw_parts(ptr, len.try_into().unwrap()) };
    let request = rkyv::from_bytes(input).unwrap_or_else(|error| panic("from_bytes", &error.to_string()));

    // Process the request.
    let response = match request {
        PluginRpc::Request(DltParserRpc::Setup(ParserSettings {
            with_storage_header,
        })) => {
            print("init parser");
            parser.with_storage_header = with_storage_header;
            PluginRpc::Response(DltParserRpc::SetupDone)
        }
        PluginRpc::Request(DltParserRpc::Parse(ParseInput { bytes })) => {
            let response: PluginRpc<DltParserRpc>;
            let mut results: Vec<ParserResult> = Vec::new();
            let mut input: &[u8] = &bytes;
            loop {
                match parser.parse(input, None) {
                    Ok((rest, Some(result))) => {
                        let bytes_remaining = rest.len();
                        let message = match result {
                            ParseYield::Message(message) => {
                                print(&format!("parse message ({} bytes remaining)", bytes_remaining));
                                Some(format!("{}", message)) // TODO
                            }
                            ...
                        };
                        results.push(ParserResult::ParseOk(ParseOutput {
                            bytes_remaining,
                            message,
                        }));
                        if rest.is_empty() {
                            response = PluginRpc::Response(DltParserRpc::ParseResult(results));
                            break;
                        } else {
                            input = rest;
                        }
                    }
                    ...
                    Err(ParserError::Parse(error)) => {
                        // Ignore expected parse errors at end of provided data.
                        if results.is_empty() {
                            results.push(ParserResult::ParseError(error));
                        }
                        response = PluginRpc::Response(DltParserRpc::ParseResult(results));
                        break;
                    }
                };
            }
            response
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

## DltParser Host proxy

The proxy will store the results retrieved from the plugin and returns them to the host as long as unconsumed results are available.

```rust,no_run
impl DltParserProxy {
    pub fn new(mut proxy: PluginProxy, with_storage_header: bool) -> Self {
        // Init plugin with given settings.
        let request: PluginRpc<DltParserRpc> =
            PluginRpc::Request(DltParserRpc::Setup(ParserSettings {
                with_storage_header,
            }));
        let request_bytes = rkyv::to_bytes::<_, 256>(&request).unwrap();

        match proxy.call(&request_bytes) {
            Ok(response_bytes) => {
                let response: PluginRpc<DltParserRpc> = rkyv::from_bytes(&response_bytes).unwrap();
                if let PluginRpc::Response(DltParserRpc::SetupDone) = response {
                    // nothing
                } 
                ...
            }
            ...
        }

        Self {
            proxy,
            results: VecDeque::new(), // Current bulk results from plugin.
        }
    }

    // Returns the next item from stored results.
    fn next_result<'b>(
        &mut self,
        input: &'b [u8],
    ) -> Option<Result<(&'b [u8], Option<ParseYield<DltProxyMessage>>), ParserError>> {
        ...
    }
}

impl Parser<DltProxyMessage> for DltParserProxy {
    fn parse<'b>(
        &mut self,
        input: &'b [u8],
        _timestamp: Option<u64>,
    ) -> Result<(&'b [u8], Option<ParseYield<DltProxyMessage>>), ParserError> {
        // As long as we have stored results we return next item.
        if let Some(result) = self.next_result(input) {
            return result;
        }

        // Create request with next chunk of data to be parsed.
        let request: PluginRpc<DltParserRpc> =
            PluginRpc::Request(DltParserRpc::Parse(ParseInput {
                bytes: input.to_vec(),
            }));
        let request_bytes = rkyv::to_bytes::<_, 256>(&request).unwrap();

        match self.proxy.call(&request_bytes) {
            Ok(response_bytes) => {
                let response: PluginRpc<DltParserRpc> = rkyv::from_bytes(&response_bytes).unwrap();
                if let PluginRpc::Response(DltParserRpc::ParseResult(results)) = response {
                    
                    // Store results and return first item, if any.
                    self.results = VecDeque::from(results);
                    if let Some(result) = self.next_result(input) {
                        result
                    } 
                    ...
            }
            ...
        }
    }
}
```