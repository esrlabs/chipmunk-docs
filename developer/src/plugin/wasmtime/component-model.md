# Component Model

- Normal Wasm modules are limited in exposing their functionalities and needs. They primarily use core WebAssembly data types, which are primarily integers and floating-point numbers.
- The [Component Model](https://component-model.bytecodealliance.org) provides richer types such as strings, lists, records, and results..
- The Component Model definitions are written in the 'WIT' (Wasm Interface Type) language. These WIT files serve as contracts between components and the host. They define the functionality each component requires and provides, as well as the data types used between them. 
- [Wasmtime](https://docs.rs/wasmtime/latest/wasmtime/component/index.html) provides [great support](advantages.md) for the Component Model on both the host and the guest sides.
- Components can be composed together to resolve dependencies and create new components that combine their capabilities. 
- Very components are available online in the [warg.io](https://warg.io/) which can be referenced directly in the plugin `toml` files with tools like [cargo component](advantages.md#organisation-and-tooling)


## Example:

Here is a small real-world example using the following `wit` as contract between the host a client:

```wit, ignore
interface parsing {
  record item {
    lines: list<string>,
    index: u64,
  }

  provide-data: func() -> list<u8>;  
}

world processor {
  use parsing.{item};

  export parse: func() -> list<item>
}
```
This files provides the following points:

- The data type `item` that has a collection of strings and an index value.
- the function `provide_data()` which returns a collection of bytes. This function must be provided by the host and can be used from the guest.
- The function `parse()` returning a collection of item. This function must be provided by the guest and can be used be the host.
