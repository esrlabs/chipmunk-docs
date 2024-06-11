# Life Sessions

## 11.06.2024 

### Meta

- **Topic**: Plugins Integration
- **Participants**: Oliver, Ammar, Kevin, Dmitry

### Conclusions / Decisions

**Switch `parse()` to async**
- **TODO**: The method `parse(..)` of the trait `Parser` has to be switched to `async`. 
- **Motivation**: Since the selected WASM runtime (`wasmtime`) is asynchronous, the `parse(..)` method should also be async. If the `parse(..)` method remains synchronous, we will have to use `futures::block_on(..)` for plugins, which is excessive. We should monitor performance with this change.
- **Assigned to**: Ammar

**DLT as the first plugin**
- **TODO**: The first example of a plugin should be the DLT plugin. 
- **Note**: We will not push the plugin into production.
- **Motivation**: Implementing the DLT plugin covers all levels of the application from the client to the Rust core, allowing for comprehensive testing. Additionally, with native DLT support, we can compare performance.
- **Assigned to**: Ammar, Dmitry (support with integration into levels above the Rust core)

**Provider as an additional type of plugin**
- **TODO**: Nothing for now, the topic is postponed.
- **Idea/Motivation**: It was agreed that in some use cases (like MDF, for example), having two parts (source, parser) for one plugin can be unnecessary. This is also relevant when a parser has a very specific source. In such cases, we don't need to split it into source and parser; we can have a plugin that introduces a `MessageProducer` with a `next()` method to provide the next available message. In general, such plugins seem reasonable.

**Not discussed**
- We still have `Parser<T: LogMessage>` with a generic type. But we never actually use `LogMessage` for anything except converting to a string. Do we really need it?
