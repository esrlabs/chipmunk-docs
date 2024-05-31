# Plugin Factory

In `application/apps/indexer/plugin/host` some generic host components are defined, such as the trait for a plugin factory and its actual implementations for `wasm` and `wasi` plugins:

```rust,no_run
pub trait PluginFactory {
    fn create(&self, id: PluginId) -> Result<PluginProxy, PluginError>;
}
```

## Wasm Plugin Factory

The implementation for a plain `wasm` plugin factory would get a precompiled WebAssembly binary and instantiate a proxy based on the `wasmer` runtime:

```rust,no_run
use wasmer::{
    imports, AsStoreRef, Function, FunctionEnv, FunctionEnvMut, Instance, Memory, Module, Store,
    TypedFunction, WasmPtr, WasmSlice,
};
...

impl WasmPluginFactory {
    pub fn new(binary: Vec<u8>) -> Self {
        WasmPluginFactory { binary }
    }
}

impl PluginFactory for WasmPluginFactory {
    fn create(&self, id: PluginId) -> Result<PluginProxy, PluginError> {
        let mut store = Store::default();

        // Load the module from the precompiled binary.
        let module = Module::from_binary(&store, &self.binary).expect("from_binary");

        // Create a plugin environment to be used at runtime.
        let plugin_env = FunctionEnv::new(&mut store, PluginEnv { id, memory: None });

        // Add a debug-print function from the host to be imported in the plugin.
        let host_print = Function::new_typed_with_env(
            &mut store,
            &plugin_env,
            |env: FunctionEnvMut<PluginEnv>, ptr: WasmPtr<u8>, len: u32| {
                let store = env.as_store_ref();
                let memory = env.data().memory.as_ref().unwrap();
                let memory_view = memory.view(store.borrow());
                let string = ptr.read_utf8_string(&memory_view, len).unwrap();
                debug!("proxy<{}> : {}", env.data().id, string);
            },
        );

        let imports = imports! {
            "host" => {
                "host_print" => host_print,
            },
        };

        // Create an instance of the plugin runtime.
        let instance = Instance::new(&mut store, &module, &imports).expect("instance");

        // Add the instance's memory to the plugin-env so it could be accessed from import functions.
        let env = plugin_env.as_mut(&mut store);
        env.memory = Some(
            instance.exports.get_memory("memory").expect("memory").clone(),
        );

        Ok(PluginProxy::new(id, store, instance))
    }
}
```

## Wasi Plugin Factory

The implementation for a `wasi` plugin factory would respectively get a precompiled WebAssembly binary and instantiate a proxy based on the `wasmer` runtime and a `wasmer_wasix` environment to support eg. system I/O operations:

```rust,no_run
use wasmer::{
    AsStoreRef, Function, FunctionEnv, FunctionEnvMut, Instance, Memory, Module, Store,
    TypedFunction, WasmPtr, WasmSlice,
};
use wasmer_wasix::{default_fs_backing, WasiEnv};

impl WasiPluginFactory {
    pub fn new(binary: Vec<u8>) -> Self {
        WasiPluginFactory { binary }
    }
}

impl PluginFactory for WasiPluginFactory {
    fn create(&self, id: PluginId) -> Result<PluginProxy, PluginError> {
        let mut store = Store::default();

        // Load the module from the precompiled binary.
        let module = Module::from_binary(&store, &self.binary).expect("from_binary");

        // Create a wasi environment to be used at runtime and map pre-opened host file handles.
        let mut wasi_env = WasiEnv::builder(format!("wasi-proxy<{}>", id))
            .fs(default_fs_backing())
            .preopen_dir(Path::new("/")) // NOTE: Map currently only the working-directory of the application.
            .expect("preopen_dir")
            .map_dir("/", ".")
            .expect("map_dir")
            .finalize(&mut store)
            .expect("finalize_env");

        let mut imports = wasi_env
            .import_object(&mut store, &module)
            .expect("imports");

        // Create a plugin environment to be used at runtime.
        let plugin_env = FunctionEnv::new(&mut store, PluginEnv { id, memory: None });

        // Add a debug-print function from the host to be imported in the plugin.
        let host_print = Function::new_typed_with_env(
            &mut store,
            &plugin_env,
            |env: FunctionEnvMut<PluginEnv>, ptr: WasmPtr<u8>, len: u32| {
                let store = env.as_store_ref();
                let memory = env.data().memory.as_ref().unwrap();
                let memory_view = memory.view(store.borrow());
                let string = ptr.read_utf8_string(&memory_view, len).unwrap();
                debug!("proxy<{}> : {}", env.data().id, string);
            },
        );

        imports.define("host", "host_print", host_print);

        // Create an instance of the plugin runtime.
        let instance = Instance::new(&mut store, &module, &imports).expect("instance");

        // Initialize the wasi environment
        wasi_env
            .initialize(&mut store, instance.clone())
            .expect("initialize_env");

        // Add the instance's memory to the plugin-env so it could be accessed from import functions.
        let env = plugin_env.as_mut(&mut store);
        env.memory = Some(
            instance.exports.get_memory("memory").expect("memory").clone(),
        );

        // Start the wasi plugin as a reactor.
        let start = instance
            .exports
            .get_function("_initialize")
            .expect("exports");
        start.call(&mut store, &[]).expect("start");

        Ok(PluginProxy::new(id, store, instance))
    }
}
```
