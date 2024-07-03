# Transition Journal

## Preliminary conclusion on the transition to a binary protocol

In the current version of chipmunk, data validation is performed:
- On the Rust side: through serialization/deserialization of data (serde), as well as part of the data being transferred to the JavaScript ecosystem as ready-made JavaScript objects.
- On the JavaScript side: received objects undergo additional validation from the ts-binding level to the client.

Thus, the current version already has validation tools that ensure the security of data transfer and processing. A comprehensive refactoring and transition to **protobuf** or **flatbuffer** seems unnecessary, as it would entail changing the entire communication chain between all components of the application (e.g., IPC (client ↔ electron) would need to be completely updated). However, where necessary, the **MessagePack** protocol can be safely integrated, allowing the avoidance of unsafe JSON with minimal changes to the current codebase.

However, the next generation of chipmunk should initially adopt **protobuf** or **flatbuffer** as the base protocol, allowing for complete abandonment of "manual" data validation at all levels of the application.


## Stage 1

The `MessagePack` library turned out to be inapplicable at the TypeScript level. Without a data schema, this library does not allow recognizing incoming messages from Rust in TypeScript. Therefore, despite the fact that using `MessagePack` is extremely convenient at the Rust level, it cannot provide reliable results at higher levels, since TypeScript is not a strictly typed language.

Using `FlatBuffers`, on the other hand, is associated with the need to account for lifetime parameters when working with `FlatBuffers` messages at the Rust level. This is due to the peculiarities of `FlatBuffers`, which provides direct access to the data as soon as it is received. Thus, using `FlatBuffers` complicates the application.

However, comparing the performance of `FlatBuffers` and `Protobuf`, one can conclude that using `FlatBuffers` is justified in some cases and does indeed provide a performance boost. But the problem is that in `chipmunk`, there are simply no use cases where `FlatBuffers` performance would yield a noticeable and significant result.

Therefore, as a result of the first stage of protocol implementation, it was decided to use `Protobuf` as the main protocol.

## Stage 2

After transitioning the main session and related APIs (error messages, events) to protobuf, a significant drawback of integrating protobuf into our solution has become evident. It's important to note that this problem isn't specific to protobuf but is a general issue applicable to any protocol we might implement in our solution.

### Overview of protobuf related crates

`protobuf` is more oriented towards dynamic handling of messages. It supports working with descriptors and allows dynamic creation of messages. By default, it does not have tools for code generation. Created 9 years ago. Supports: proto2, proto3.

`prost` is more oriented towards using protobuf with code generation (for which the `prost-build` crate is used). It has a more user-friendly API and allows mapping structures to protobuf message fields (using the `prost` proc-macro). Created 7 years ago. Supports: proto2, proto3.

`protobuf-serde` allows mapping structs to messages, but the trait is outdated and seems to be not well-supported. It was probably created for a specific project.

### Problem Overview

In many cases, the backend sends data to the frontend that is associated with certain structures. For instance, we have an object `DltParserSettings` which is part of the `sources` crate. `DltParserSettings` also includes `DltFilterConfig`, which is part of an external crate `dlt_core`. The main object `DltParserSettings` is part of an even more complex object `ObserveOptions` that comes from the frontend.

`ObserveOptions` needs to be included in a protobuf message for subsequent transmission. However, the structure of the object becomes quite complex:

`ObserveOptions -> ParserType -> DltParserSettings -> DltFilterConfig`

Using the classical approach, we generate Rust or TypeScript code for the given protocol (*.proto files) and then use the generated code for packing, unpacking, and sending messages. This approach inevitably involves deep and complex data conversion. For example,

- `DltFilterConfigProtoMsg` → `DltFilterConfig`
- `DltParserSettingsProtoMsg` → `DltParserSettings`
- `ParserTypeProtoMsg` → `ParserType`
- `ObserveOptionsProtoMsg` → `ObserveOptions`

to ultimately obtain:

`ObserveOptions -> ParserType -> DltParserSettings -> DltFilterConfig`

Given the volume of such operations, transitioning to this protocol reduces flexibility and introduces potential error points. Moreover, some types might not match, for example, `usize` is not supported by protobuf.

### Alternative Approach

An alternative approach is generating *.desc files (binary protocol description). This method allows us to partially automate the process, but it doesn't eliminate the need to manually convert final types from protocol types (`ObserveOptionsProtoMsg` → `ObserveOptions`). Additionally, it doesn't solve type mismatch issues.
