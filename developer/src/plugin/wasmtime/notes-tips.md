# Notes & Tips

- The current performance gap between wasm and native in DLT parser seems to be SIMD optimizations since are used in the implementation. It's worth noting that wasm runtime support one thread only.
- Copying the memory doesn't seem to be the bottleneck, as we got almost nearly identical performance to native code in a simple data source implementation. 
- Frequent calls to Wasm methods from the host have a noticeable negative impact on performance. It's advisable to minimize these calls and cache data whenever possible. In the case of the parser, calling the plugin method each time parse is invoked, without unnecessary data copying, resulted in a performance that was 6 times slower than native code with asynchronous execution. Temporarily removing the asynchronous code reduced the performance difference to 1.6 times, but it still worse than the caching solution even with async as the results are about 1.35x only. 

## Debugging
- Generally, it's possible to debug the plugins directly from the host for standard wasm plugins without the component model feature. Debugging must be enabled in the engine configuration. Here is a link to a [working example](https://docs.wasmtime.dev/examples-rust-debugging.html).
- However, breakpoints cannot be resolved when using the component model with the `wasmtime::bindgen` macros on the host and `wit-bindgen::generate` on the guest. There is no documentation about this yet; it might become available in the future or with more in-depth investigation.
- There is other possibilities for debugging using [Debugging WebAssembly with Core Dumps](https://docs.wasmtime.dev/examples-debugging-core-dumps.html), to create core-dumps on errors. Here is [an example](https://docs.wasmtime.dev/examples-rust-core-dumps.html).  
