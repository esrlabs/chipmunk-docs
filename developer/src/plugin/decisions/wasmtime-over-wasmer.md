# Runtime: Wasmtime

This document details the selection of a WebAssembly runtime for the Chipmunk plugin system. After evaluating available options, Wasmtime was chosen over Wasmer for the reasons outlined below:

* **Community and Backing:** Wasmtime benefits from strong support from the Rust community and is a project under the [Bytecode Alliance](https://bytecodealliance.org/), featuring well-known developers and backed by significant companies and organizations, contributing to its long-term viability and future-proofing.
* **Documentation and Tooling:** Compared to Wasmer, Wasmtime provides more comprehensive documentation and better-integrated tooling for development.
* **Component Model Support:** Wasmtime offers excellent and mature support for the WebAssembly [Component-Model](https://component-model.bytecodealliance.org/), including robust bindgen tools and CLI utilities essential for developing and composing components across various programming languages.
* **Developer Experience:** Using Wasmtime allows developers to avoid manual unsafe code or reliance on external libraries beyond the core runtime crate.
* **Industry Adoption:** Wasmtime is actively used in numerous other open-source projects, providing valuable real-world usage examples and potential for shared knowledge and improvements.

For more detailed documentation on each runtime:

* [Wasmtime](../wasmtime)
* [Wasmer](../wasmer)
