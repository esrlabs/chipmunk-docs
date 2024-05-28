# Wasmtime Advantages

## Organisation and Tooling:

Wasmtime is part of the suite of tools and crates provided by [Bytecode Alliance Organisation](https://bytecodealliance.org/), which represents the collective efforts of the Rust community in advancing WebAssembly technology. Many members of this organization are also active contributors to the Rust programming language. Additionally, the Bytecode Alliance is supported by various companies.

Wasmtime is part of a suite of crates and tools designed around Wasm, Wasi, and  [The Component Model](component-model.md):

- [Cargo Component](https://github.com/bytecodealliance/cargo-component): CLI tool to create, build and release components with rust programming language. 
- [wit-bingen](https://github.com/bytecodealliance/wit-bindgen): Crate that provides the macro `generat!` to generate types and functions from `wit` files.
- [WebAssembly Compositions (WAC)](https://github.com/bytecodealliance/wac): CLI tool for composing WebAssembly Components together.
- [Cranelift](https://cranelift.dev/): The compiler backend that most WebAssembly run-times use.
- [wasmtime-wasi](https://docs.rs/wasmtime-wasi/21.0.1/wasmtime_wasi/): Crate to manage and run Wasi.


## Advantages:

- Well-documented and easy to configure with extensive WebAssembly options and proposals.
- Support for Wasi with straightforward configuration and the ability to provide custom implementations for Wasi interfaces such as stdio, file-system configurations, and permissions..
- Path configurations allow for specifying directory paths with different permissions, and paths on the guest side can be configured to appear with different names than on the host for added security.
- The macro [bindgen!()](https://docs.rs/wasmtime/latest/wasmtime/component/macro.bindgen.html) macro on the host side is similar to `generate!()` from `wit-bindgen` and allow generating the types and the functions from `wit` files.
- Nightly not required & No need to write unsafe code
- Users can provide plugins written in any language compiled to WebAssembly as long as they comply with the contract defined in the WIT file. For Rust users, macros or project templates can simplify plugin development by requiring only logic for parsing or reading.  
- We can define a single API on the host for the producer functionality. This API can support standalone plugins with custom implementations for data source and parsing. Additionally, it can be used with composed source and parser plugins.
- Plugins are compiled as libraries and don't have to have their own runtime and main function. 
- Many Projects are using it and can be used for references. 
  - [Zed Editor](https://github.com/zed-industries/zed): Uses the component model and compile the plugins in run-time. Good source to check how version compatibilities problem are solved.
  - [Veloren Game](https://github.com/veloren/veloren): Multiplayer voxel RPG. It uses the component model for the plugins as well.
  - [Lapce Editor](https://github.com/lapce/lapce): Using Wasi version 0.1 without the component model.
