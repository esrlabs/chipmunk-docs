# The `plugins_api` Crate

For developers writing plugins in Rust, the `plugins_api` crate is provided to significantly simplify the development process. This crate automates the WebAssembly bindgen process and exposes the defined WIT contracts as idiomatic Rust traits and functions.

The crate includes ready-to-use helper functionalities such as integration with the standard Rust `log` crate for logging and utilities for accessing plugin configurations. It also provides export macros for plugin structs, which include specific performance optimizations for data transfer across the WASM boundary [see](./data-transfer.md).

The creation of this crate shows our commitment to supporting Rust as a primary language for Chipmunk plugins and is used for developing our own plugins. Starter templates using this crate are available for each plugin type to help developers get started quickly.

The `plugins_api` crate is located within the main Chipmunk repository rather than being a separate open-source project, a decision made to simplify development of open-source projects. As this crate is specifically designed for use with Chipmunk, it is not published on crates.io.

Rust plugin developers should add the crate as a git dependency pointing to the Chipmunk repository. Please note that using a git dependency currently requires cloning the entire Chipmunk repository into your local cargo cache.

