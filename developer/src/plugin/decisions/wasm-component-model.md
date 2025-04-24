# WebAssembly & Component Model

Evaluation of technical approaches for the Chipmunk plugin system, leading to the selection of WebAssembly and the Component Model. The alternatives considered are outlined below:

## Scripting Languages

Scripting languages like JavaScript or Lua were considered, utilizing Rust runtimes such as `deno` or `lua-jit`.

### Pros

* **Rapid Development:** Dynamic typing and lack of a compilation step for plugin code enable faster testing and iteration cycles.

### Cons

* **Performance:** JIT performance can be less predictable and consistently slower than native code.
* **Sandboxing:** Implementing strong isolation is complex.
* **API Versioning:** Difficult without compile-time checks, increasing runtime risks.
* **Integration:** Overhead when interacting with native Rust types.

## Native Code Plugins (FFI)

This approach involves implementing plugins as native binaries (e.g., dynamic libraries or DLLs) written in Rust, loaded and interacted with at runtime using Foreign Function Interface (FFI) bindings.

### Pros

* **Native Performance:** Plugins execute at native Rust speeds with minimal FFI call overhead. Potential for shared memory access exists.
* **Same Language:** Plugins can be written in Rust, the same language as the host application.

### Cons

* **FFI Complexity & Unsafety:** Requires defining APIs using C-compatible types. FFI calls are inherently `unsafe` and introduce overhead.
* **Limited Safety & Isolation:** Native code cannot be effectively sandboxed, posing significant security risks due as plugins have direct access to host memory.
* **API Versioning:** Managing API compatibility between the host and dynamically loaded plugins is challenging without compile-time checks.
* **Platform Dependence:** Plugins must be compiled and distributed specifically for each target operating system and architecture.

## WebAssembly & Component Model:

This is the chosen solution. Plugins are written in WebAssembly (WASM). While raw WASM provides only primitive types for communication, which would make defining complex APIs challenging, error-prone, and difficult to validate and maintain, we leverage the [Component Model](https://component-model.bytecodealliance.org/) to define rich and well-structured interfaces. Plugins are built as WASM components that adhere to these defined APIs. The Chipmunk host includes a WASM runtime capable of running these components, and plugins interact with host resources through controlled access via WASI.


### Pros:

* **Performance:** Offers near-native execution speed with minimal overhead.
* **Security & Isolation:** Provides strong sandboxing by default, giving plugins their own memory and requiring explicit, controlled access to host resources via WASI.
* **Clear API & Versioning:** The Component Model and WIT (WebAssembly Interface Type) files define explicit API contracts including metadata like plugin's name and version within the WASM binary.
* **Language Agnostic:** Plugin developers can use any programming language that compiles to WASM and supports the Component Model, without requiring host-side changes for different languages.
* **Portability:** Plugins are compiled to WASM once and can run on any platform where the Chipmunk host and its WASM runtime are supported.

### Cons:

* **Memory Model:** Isolated memory prevents direct access to the host's memory, necessitating careful design for efficient data transfer between host and plugin.
* **Maturity:** The WebAssembly Component Model is a relatively young technology that is still undergoing active and rapid development.
* **Development Workflow:** Requires a compilation step for plugin code, unlike dynamic scripting languages.
* **Debugging:** Debugging WASM modules can sometimes be more challenging than debugging native code.


