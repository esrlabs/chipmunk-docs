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