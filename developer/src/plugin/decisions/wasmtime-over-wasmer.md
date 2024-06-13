# Wasmtime Over Wasmer

- `wasmtime` has more support from the Rust community since it's a project from the [Bytecode Alliance](https://bytecodealliance.org/) organization. It features many well-known developers in the Rust community as lead developers and is supported and funded by various companies and organizations, making it more future-proof.
- `wasmtime` has much better documentation for the crate and its tooling compared to `Wasmer`.
- It offers great support for the [Component-Model](https://component-model.bytecodealliance.org/) approach, combining it with a lot of tooling for many programming languages.
- The **Component-Model** provides an excellent way for plugins to communicate with the host. It's widely approved and used by many projects. Therefore, it will be used in the plugin system, even though it is still a very young project at this time.
- Bindgens are provided on both the host and the plugin sides, along with CLI tools to compile, evaluate, and compose the components, and much more.
- No nightly features or unsafe code need to be written by hand.
- No libraries outside of `wasmtime` are needed.
- Many other open-source projects are using it and can be referenced for inspiration.

- For more detailed documentation:
  - [Wasmtime](../wasmtime)
  - [Wasmer](../wasmer)

