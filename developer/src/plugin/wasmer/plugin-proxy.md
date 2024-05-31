# Plugin Proxy

In `application/apps/indexer/plugin/host` a generic plugin proxy is provided for the RPC communication from the host to the plugins:

```rust,no_run
// The shared plugin-env during runtime.
#[derive(Clone, Debug)]
struct PluginEnv {
    id: PluginId, // The id of the plugin for debug prints to the host.
    memory: Option<Memory>, // The plugin's memory to be accessed in imported functions.
}

impl PluginProxy {
    pub fn new(id: PluginId, store: Store, instance: Instance) -> Self {
        // Create a handle for the plugin's function to receive RPC messages.
        let message: TypedFunction<(WasmPtr<u8>, WasmPtr<u8>, u32), ()> = instance
            .exports
            .get_typed_function(&store, "message")
            .expect("function");

        PluginProxy {
            id,
            store,
            instance,
            message,
        }
    }

    ...

    // Send RPC requests to the plugin and receive the results.
    fn call(&mut self, request: &[u8]) -> Result<Vec<u8>, PluginError> {
        // Create layout for input and output data in the plugin's memory.
        let output_offset: u32 = 0;
        let output_len = 2 * size_of::<u32>() as u32;
        let input_offset: u32 = output_len; // 4Byte aligned!

        // Wite request data into the plugin's memory.
        let memory = self.instance.exports.get_memory("memory").expect("memory");
        {
            let memory_view = memory.view(&self.store);
            memory_view
                .write(input_offset.into(), request)
                .expect("write");
        }

        let output_ptr = WasmPtr::new(output_offset);
        let input_ptr = WasmPtr::new(input_offset);

        // Send RPC request to the plugin.
        self.message
            .call(&mut self.store, output_ptr, input_ptr, request.len() as u32)
            .expect("call");

        // Retrieve RPC request from the plugin's memory.
        let memory = self.instance.exports.get_memory("memory").expect("memory");
        let memory_view = memory.view(&self.store);

        let slice: WasmSlice<'_, u8> = output_ptr.slice(&memory_view, output_len).unwrap();
        let bytes = slice.read_to_bytes().unwrap();
        let buffer: &[u8] = bytes.as_ref();

        let addr: u32 = LittleEndian::read_u32(&buffer[..size_of::<u32>()]);
        let len: u32 = LittleEndian::read_u32(&buffer[size_of::<u32>()..]);
        let ptr: WasmPtr<u8> = WasmPtr::new(addr);
        let data: WasmSlice<'_, u8> = ptr.slice(&memory_view, len).unwrap();

        let response = data.read_to_vec().unwrap();
        Ok(response)
    }
}
```