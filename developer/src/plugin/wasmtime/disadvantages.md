# Disadvantages


## Wasi & Tokio

- Wasmtime uses tokio runtime under the hood sync and async contexts. With sync context it blocks on the tokio spawned thread to bridge between sync and async worlds. [link](https://docs.rs/wasmtime/latest/wasmtime/struct.Config.html#method.async_support)
- When Wasi is initiated from within tokio runtime, it's required to activate async support in the WebAssembly configuration and set the `async` flag in the `bindgen!` macro. This ensures that Wasmtime utilizes the host runtime rather than creating a new one, preventing runtime panics when attempting to spawn a new tokio thread.
- This leads to a problem when WASI is spawned within a tokio runtime but isn't intended for asynchronous use, such as in parser scenarios. All functions from the guest are marked as asynchronous, requiring a bridge to synchronous execution. 
- Currently we are using the method `futures::executor::block_on()` to run async functions synchronously, but this can have negative impact on the performance.
- As a workaround in the parser, we minimize function calls by providing all results from the provided bytes at once, subsequently caching them on the host.
- Even without enabling async support, invoking a plugin function from the native side appears to be a bottleneck, therefore it would always better to minimize the function calls and caching the results.

## Memory Sharing

- Currently, direct access to host memory from the client by reference isn't feasible. The struct [ExternRef](https://docs.rs/wasmtime/latest/wasmtime/struct.ExternRef.html) defined in Wasmtime for this purpose, is supported on the host side but inaccessible on the client side using Rust. While the crate [ExternRef](https://docs.rs/externref/latest/externref/) appears to address this limitation, it's relatively unpopular and contains a significant amount of unsafe code, which is best avoided unless absolutely necessary.
- Sharing memory between the host and the components can't be achieved through the structs [Memory](https://docs.rs/wasmtime/latest/wasmtime/struct.Memory.html) or [SharedMemory](https://docs.rs/wasmtime/latest/wasmtime/struct.SharedMemory.html) as they are not supported on the client side either.
- Similarly, accessing shared memory via pointers is not viable because the host and each plugin possess their own memory address spaces, defined arbitrarily at runtime. There are ongoing discussions, along with proposals and open issues, aimed at devising a more efficient means of sharing memory between hosts and guests.
- The optimal approach at present is to use resources in the component model, which are traits that defined in the `wit` file and can be implemented on both the host and the client and can be passed between them via references. It has the limitation though, that their methods cannot return self-referential data, resulting in unnecessary data copying.

### Related Issues:

- [Efficient memory passing between WASM and host](https://github.com/WebAssembly/component-model/issues/314)
- [Support sharing mutable memory between host and guest](https://github.com/WebAssembly/WASI/issues/594)

