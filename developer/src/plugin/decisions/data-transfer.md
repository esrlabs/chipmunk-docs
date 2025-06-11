# Optimize Data Transfer

WebAssembly's isolated memory model requires us to copy data between the host and plugin memory spaces. This requirement created several challenges that shaped our internal design, especially for how we transfer data with plugins.

## The Component Model's Approach to Memory

While core WebAssembly allows for shared memory, the Component Model disallows it by design. This choice improves security and ensures that languages with different memory approaches (like those with or without a garbage collector) can interact safely.

The Wasmtime runtime does provide structs to share memory between the host and a guest, but this is for core WebAssembly APIs. These specific memory-sharing tools are not used when interacting via the Component Model, which enforces a stricter boundary between components.

The Component Model introduces a helpful feature called **resources**, which act like handles or pointers that can be passed efficiently between the host and guest. However, the Component Model's rules don't allow functions to return direct references to data held within a resource. Instead, to get data out, a method must return an owned value (like a `String` or `Vec`). This means the component itself must allocate memory and copy its internal data before returning it. So while resources are a great way to manage state, this again shows why copying is fundamental to component interactions.

Looking forward, there is a proposal for [static buffers](https://github.com/WebAssembly/component-model/issues/314) that could help with some of these problems, but this is still a work in progress.

Given the Component Model's current approach to memory, we have developed our own strategies to transfer data between the host and plugins as efficiently as possible.

The following sections describe the solutions we implemented to address specific challenges.

## Data transfer with Parser Plugin

The initial parser design allowed processing raw bytes by reference and returning a single parsed item per call. When adapting this for WASM plugins, the isolated memory required copying the entire input byte chunk for each individual parse call, creating a significant performance bottleneck. The overhead of frequent function calls across the WASM boundary also contributed to this issue.

To overcome these limitations, the parser interface was revised. The `parse()` function now accepts a larger chunk of raw bytes and is expected to parse and return all available items from that chunk in a single operation. This strategy dramatically reduces the number of data copies and cross-boundary function calls, leading to substantial performance improvements.

As an added benefit, this change also improved the performance of the native parsers, which were subsequently updated to process and return multiple items per call, resulting in improved performance across the board.

## Multi-Column Log Transfer

Parsed log messages in Chipmunk can structure their content as either a single string (`Line`) or multiple string fields (`Columns`). Initially, transferring the `Columns` variant from a WASM plugin to the host was inefficient, as each string within the list required separate transfer across the WASM boundary before being reconstructed on the host side.

To minimize this performance impact specifically for Rust plugins, an optimization was implemented within the `plugins_api` export macros. When a plugin provides a message using the `Columns` variant, the macro automatically joins the individual column strings into a single string using a predefined internal separator *before* transferring it to the host.

This strategy aligns well with Chipmunk's internal design, which processes multi-column messages by merging columns with this same separator anyway. Performing the join in the plugin via the macro significantly reduces the number of cross-boundary data transfers. This encoding technique resulted in an approximate 30% performance improvement for both `parser` and `producer` plugins handling multi-column messages without changing their public API.

