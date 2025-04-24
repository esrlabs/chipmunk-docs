# Async Parser

## Problem Description:
- `wasmtime-wasi` uses [tokio](https://tokio.rs/) under the hood. When async support isn't configured, it will spawn its own tokio runtime and block on each call to bridge it to a sync context. However, it uses the host runtime if async support is enabled in the configurations.
- Enabling async support forces the initialization of the plugin to be async, which can be achieved by enabling the async flag in the `bindgen!()` macro. This will make all function calls from the plugin async, as there is no way to configure the exports in the macro as for the imports.
- This leads to a problem with the parser plugin because `parse()` in the `Parser` trait isn't async.

To solve this, there are two approaches:

## Bridging with [futures::executor::block_on](https://docs.rs/futures/latest/futures/executor/fn.block_on.html)

- With this approach, we are bridging with sync code by blocking on the async calls of the plugins' methods.
- This shouldn't have a noticeable impact on performance as long as we don't call plugin methods too often.

### Advantages:
- There is no need to change the native code or impact its performance.
- We already avoid calling plugins too often by letting the plugin parse all the given data at once, returning a collection of parse results at once. Calling plugin methods too often negatively impacts performance, even for non-async functions.
- Parsing inside the plugins isn't async, so blocking on it won't produce too much overhead since the parse function won't yield in-between anyway.

### Disadvantages:
- The method `parse()` is called form within an async context in method `async read_next_segment()` in the producer. It doesn't make sense from the plugin perspective to block on an async function which is called from an async context.
- Changing `parse()` to async using Rust's native support for `async_in_trait` incurs almost no overhead to make the method async. (More info below)


## Make `parse()` function Async
- This approach changes the signature of the `parse()` function in the `Parser` trait to make it async using Rust's native support for async in traits, which will be desugared as follows:

```rust,ignore
pub trait Parser<T> {
  fn parse<'a>(...) -> 
      impl std::future::Future<Output = Result<(&'a [u8], Option<ParseYield<T>>), Error>> + Send;
}
```
### Advantages:
- This change shouldn't impact the native non-async function since there is no extra heap allocation to make the function async, unlike using the [async_trait](https://crates.io/crates/async-trait) crate.
- With this change, we don't have to block on parse calls from the plugins, reducing the overhead of using a mini runtime to block on the async calls of the parser plugins.

### Disadvantages:
- When this was implemented, we encountered a compiler error in the `execute()` method in `session/src/operations.rs` when the task was spawned, even though the code changes were in the `parser` and `sources` libraries. The error message:

```bash
implementation of `std::marker::Send` is not general enough ...
= note: `std::marker::Send` would have to be implemented for the type `String`, for any two lifetimes `'0` and `'1`...
= note: ...but `std::marker::Send` is actually implemented for the type `String`, for some specific lifetime `'2`
```
- This error occurs because the generic return value of the DLT parser has references to other structs with specific lifetimes, which causes problems in the current Rust if a future of a struct with references and lifetimes is used within an async stream inside a spawned task. There are many reported issues for this error:
  - [Incorrect "implementation of Send is not general enough" error with lifetimed Send impl used in async fn](https://github.com/rust-lang/rust/issues/96865)
  - [Lifetime bounds in auto trait impls prevent trait from being implemented on generators](https://github.com/rust-lang/rust/issues/64552)

- To solve this error, we must replace the references and lifetimes in the result struct of the DLT parser `FormattableMessage<'a>` with `std::sync::Arc` as following:
```rust,ignore
// Current implementation:
pub struct FormattableMessage<'a> {
    pub message: Message,
    pub fibex_metadata: Option<&'a FibexMetadata>,
    pub options: Option<&'a FormatOptions>,
}

// implementation after replacing direct references with Arcs
pub struct FormattableMessage {
    pub message: Message,
    pub fibex_metadata: Option<Arc<FibexMetadata>>,
    pub options: Option<Arc<FormatOptions>>,
}
```
- This change will have an additional negative impact on the performance of the DLT parser due to the overhead of using `Arc` compared to direct references.

## Benchmarks

This basic benchmarks were done on a DLT file with a size of 541 MB.

|                           | Async Parser   | Bridging       |
|---------------------------|----------------|----------------|
| Native No FormatOptions   | 11.4 Secs      | 11.4 Secs      |
| Native With FormatOptions | 12.0 Secs      | 11.85 Secs     |
| Plugin  No FormatOptions  | 14.9 Secs      | 14.9 Secs      |

The results indicate:
- Changing `parse()` to async has no negative impact on the native implementation.
- Replacing direct references with `std::sync::Arc` has a slightly negative effect on performance.
- Changing `parse()` to async instead of bridging using `block_on()` has no positive impact on the plugin implementation.

## Cancel-Safety:

Making `parse()` will impact the cancellation safety of the producer in the method that pulls more bytes and then parse them, because we depends on that there is no yield points when we call parse after pulling new bytes and the internal buffer is emptied.

## Conclusion

- Since changing the trait signature to async has no positive impact on the plugins and has a slightly negative impact, we decided to keep the function sync and use bridging for the async call from the plugin, until specifying which function in `bindgen!()` macro is supported.
- We may need to use `Arc` with `FormattableMessage<'a>` when the provider (producer) plugin will be implemented because we encountered a similar compiler error in the prototyping phase.
