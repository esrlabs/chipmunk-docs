# Async Parser

## Problem Description:
- `wasmtime-wasi` uses [tokio](https://tokio.rs/) under the hood. When async support isn't configured, it will spawn its own tokio runtime and block on each call to bridge it to a sync context. However, it uses the host runtime if async support is enabled in the configurations.
- Enabling async support forces the initialization of the plugin to be async, which can be achieved by enabling the async flag in the `bindgen!()` macro. This will make all function calls from the plugin async, as there is no way to configure the exports in the macro as for the imports.
- This leads to a problem with the parser plugin because `parse()` in the `Parser` trait isn't async.

To solve this, there are two approaches:

## Bridging with [block_in_place](https://docs.rs/tokio/latest/tokio/task/fn.block_in_place.html) & [Handle::block_on](https://docs.rs/tokio/1.45.1/tokio/runtime/struct.Handle.html#method.block_on)

This approach bridges asynchronous operations into a synchronous context by explicitly informing the Tokio runtime about a potentially blocking operation. It then blocks on the future using the current task's executor. This method is safer than `futures::executor::block_on` because the runtime is aware of the blocking, preventing the entire Tokio runtime from becoming unresponsive. While it involves an extra step to notify the runtime, this did not cause any noticeable performance degradation.

### Advantages:
* No changes are needed to the native code, thus not impacting its performance.
* Chipmunk's design already limits frequent plugin method calls by having plugins parse and return all results in one go, which mitigates performance concerns of blocking.
* Parsing within plugins is synchronous, so blocking on these calls introduces minimal overhead as the parse function does not yield.
* Utilizes the main Tokio runtime executor, avoiding the overhead of a separate local executor (unlike `futures::executor::block_on`).
* The runtime is informed about potential blocking, preventing the entire runtime from being blocked even if the plugin's `parse` call takes time.

### Disadvantages:
* The `parse()` method is called from an asynchronous context (`async read_next_segment()` in the producer), making the act of blocking on an asynchronous function from an asynchronous context conceptually less straightforward from the plugin's perspective.

---

## Bridging with [futures::executor::block_on](https://docs.rs/futures/latest/futures/executor/fn.block_on.html)

This approach bridges asynchronous plugin method calls into a synchronous context by directly blocking on the future. Performance impact is minimal as long as plugin methods are not called too frequently.

### Advantages:
* No changes are needed to the native code, thus not impacting its performance.
* Chipmunk's design already limits frequent plugin method calls by having plugins parse and return all results in one go, which mitigates performance concerns of blocking.
* Parsing within plugins is synchronous, so blocking on these calls introduces minimal overhead as the parse function does not yield.

### Disadvantages:
* The `parse()` method is called from an asynchronous context (`async read_next_segment()` in the producer), making the act of blocking on an asynchronous function from an asynchronous context conceptually less straightforward from the plugin's perspective.
* This method uses a local executor, separate from Tokio's main runtime executor.
* It will block the entire Tokio runtime until the future completes, potentially causing responsiveness issues.
* A fully asynchronous `parse()` implementation (using Rust's native `async_in_trait`) would incur minimal overhead, making `block_on` a less ideal long-term solution in comparison.


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
- Changing `parse()` to async instead of bridging using `block_in_place` then `block_on()` has no positive impact on the plugin implementation.

## Cancel-Safety:

Making `parse()` will impact the cancellation safety of the producer in the method that pulls more bytes and then parse them, because we depends on that there is no yield points when we call parse after pulling new bytes and the internal buffer is emptied.

## Conclusion

- Since changing the trait signature to async has no positive impact on the plugins and has a slightly negative impact, we decided to keep the function sync and use bridging for the async call from the plugin, until specifying which function in `bindgen!()` macro is supported.
- We may need to use `Arc` with `FormattableMessage<'a>` when the provider (producer) plugin will be implemented because we encountered a similar compiler error in the prototyping phase.
