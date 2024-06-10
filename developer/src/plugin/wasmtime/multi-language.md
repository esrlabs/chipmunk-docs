# Multi-Language Plugins

With WASM, it's possible to write plugins in any language that compiles to WebAssembly and supports the component model.
Many languages support WebAssembly and can be compiled to WASM modules, then with tools like [wasm-tools](https://github.com/bytecodealliance/wasm-tools), it can be possible to create components from them, producing WASM-components files that can be loaded and validated by `wasmtime` host.

## C & C++

Writing plugins in C or C++ can be done using the following steps and tools:

### 1. Code Generation & Bindgen

[wit-bindgen CLI tool](https://github.com/bytecodealliance/wit-bindgen#cli-installation) can be used to generate all functions and types form a `wit` file with the command:

```bash
wit-bindgen c {PATH_TO_WIT_FILE}
# Generating "host.c"
# Generating "host.h"
# Generating "host_component_type.o"
```

This command will generate `*.h`, `*.c`, and `*.o` files from the `wit` file, which can be included in C or C++ code.
For example, we created the file `my-component.c` and included the host header files in it to use the types and functions from the host, providing the needed functions from the plugin:

```c
// Generated header from wit-bindgen command 
#include "host.h"

void host_run() {
  // Calling function on the host 
  host_print(&my_string);
  //...
}
```

### 2. Compiling as WASM Component

C and C++ code can be compiled for the wasm32-wasi target using the [WASI SDK](https://github.com/webassembly/wasi-sdk) project. 
`WASI SDK` provides `clang` binaries in their releases, which are pre-configured to compile to WebAssembly. These binaries can be downloaded from their release pages and used directly to compile:

```bash
# The `clang` command here should be the binary from `WASI SDK` releases.
clang host.c host_component_type.o my-component.c -o my-core.wasm -mexec-model=reactor
```

This command will create the file `my-core.wasm`, which we need to convert to a WASM component using the [wasm-tools CLI](https://github.com/bytecodealliance/wasm-tools) to create a new WASM component based on the created WASM module:

```bash
wasm-tools component new ./my-core.wasm -o my-component.wasm
```

We can use `wasm-tools` to inspect the output binary:
```bash
wasm-tools component wit ./my-component.wasm
```

The created `my-component.wasm` file can be used and validate by a `wasmtime` Rust host.

### References & Links:

- [wasi-sdk](https://github.com/webassembly/wasi-sdk).
- [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen?tab=readme-ov-file#guest-cc).
- [wasm-tools](https://github.com/bytecodealliance/wasm-tools).
