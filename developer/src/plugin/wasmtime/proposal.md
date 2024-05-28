# Plugin Proposal

* The General Proposal is to use `wit` files to define the data types and functions provided by both the host and the plugins.
* Using `wit` files allows for  plugins written in any language that can compile to WebAssembly, provided they comply to the contract defined in the WIT file.
* For Rust plugin we can provide project templates (can be used with [cargo generate](https://github.com/cargo-generate/cargo-generate)) and code examples. Additionally, we can provide a crate containing macros or functions to help the users in implementing the necessary functionality only.

