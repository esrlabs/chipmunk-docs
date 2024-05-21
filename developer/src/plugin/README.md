# Plugins for chipmunk

The two main WebAssembly (WASM) runtimes used in Rust are Wasmtime and Wasmer. These runtimes are popular for several reasons, largely due to their unique features, performance characteristics, and their integration with the Rust ecosystem.

Those runtimes are used in Rust due to their strong focus on portability, security, and performance. They both support WASI, enabling system-level operations in a portable way, and integrate well with the Rust ecosystem. Wasmtime is known for its simplicity and developer-friendly design, while Wasmer offers flexibility with multiple backends and comprehensive ecosystem tools like WAPM. Both runtimes are actively developed and supported by robust communities, making them reliable choices for running WebAssembly in Rust applications.

In the following we will document the experiences we had implementing a plugin-system with either of
those runtimes.

