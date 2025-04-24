# Optimize Data Transfer

WebAssembly's isolated memory model requires copying data (raw bytes and parsed items) between the host and plugin memory spaces. This requirement presented several challenges that influenced the internal design of Chipmunk, particularly regarding data transfer with plugins.

## Data transfer with Parser Plugin

The initial parser design allowed processing raw bytes by reference and returning a single parsed item per call. When adapting this for WASM plugins, the isolated memory required copying the entire input byte chunk for each individual parse call, creating a significant performance bottleneck. The overhead of frequent function calls across the WASM boundary also contributed to this issue.

To overcome these limitations, the parser interface was revised. The `parse()` function now accepts a larger chunk of raw bytes and is expected to parse and return all available items from that chunk in a single operation. This strategy dramatically reduces the number of data copies and cross-boundary function calls, leading to substantial performance improvements.

As an added benefit, this change also improved the performance of the native parsers, which were subsequently updated to process and return multiple items per call, resulting in improved performance across the board.

## Multi-Column Log Transfer

Parsed log messages in Chipmunk can structure their content as either a single string (`Line`) or multiple string fields (`Columns`). Initially, transferring the `Columns` variant from a WASM plugin to the host was inefficient, as each string within the list required separate transfer across the WASM boundary before being reconstructed on the host side.

To minimize this performance impact specifically for Rust plugins, an optimization was implemented within the `plugins_api` export macros. When a plugin provides a message using the `Columns` variant, the macro automatically joins the individual column strings into a single string using a predefined internal separator *before* transferring it to the host.

This strategy aligns well with Chipmunk's internal design, which processes multi-column messages by merging columns with this same separator anyway. Performing the join in the plugin via the macro significantly reduces the number of cross-boundary data transfers. This encoding technique resulted in an approximate 30% performance improvement for both `parser` and `producer` plugins handling multi-column messages without changing their public API.

