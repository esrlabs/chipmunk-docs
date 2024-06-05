# Plugin Proposal

* The General Proposal is to use `wit` files to define the data types and functions provided by both the host and the plugins.
* Using `wit` files allows for  plugins written in any language that can compile to WebAssembly, provided they comply to the contract defined in the WIT file.
* For Rust plugin we can provide project templates (can be used with [cargo generate](https://github.com/cargo-generate/cargo-generate)) and code examples. Additionally, we can provide a crate containing macros or functions to help the users in implementing the necessary functionality only.

## Chipmunk Implementation:
- The main idea is to provide an alternative message-producer with plugin support to be used alongside the native one.
- We can define the `MessageProducer` to use with generics:
```rust
pub trait MessageProducer<T> {
    pub fn as_stream(&mut self) -> impl Stream<Item = (usize, MessageStreamItem<T>)> + ...;
}
```
### WASM-Producer
- We create a producer struct to encapsulate the plugin cases.   
- The struct can be set behind a feature flag.
- It can support the following four use-cases:
  1. Parser as plugin and byte-source is native.
  2. Parser is native and Source is plugin which is given to the native `BinaryByteSource` to do the buffering internally. This can be changed to handle buffering on the plugin side if needed.
  3. Parser and source as two different plugins, which requires more data copying since it needs to be sent to the host for buffering and then sent back to the parser plugin.
  4. Stand-alone producer as a plugin that can be developed directly for special data types like MDF files. The same architecture can be used with composed plugins from a parser and a source plugin, along with a third plugin for buffering. By composing these plugins, we get one plugin that can be treated as a stand-alone one.
