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

## Protobuf usage (stage 2)

After transitioning the main session and related APIs (error messages, events) to protobuf, we can make some summary of results.

### Overview of Results/Consequences of Transitioning to `protobuf`

| Factor | Impact |
|---|---|
| Resolves issues with JSON deserialization (particularly string encoding issues) | 5 |
| Significantly reduces message size | 5 |
| Introduces a unified description of all messages/events used in the application (`*.proto` files) | 4 |
| Substantially increases the performance of message encoding/decoding (compared to JSON) | 3 |

| Factor | Impact |
|---|---|
| Requires an additional build step: code generation for `Rust` and `TypeScript` | 3 |
| Requires installation of additional dependencies during build: `protoc` for code generation | 3 |
| Generated code does not always meet standards, requiring more tolerant linting (`eslint` for `TypeScript` and `clippy` for `Rust`) | 4 |
| Introduces two additional packages: an `npm` package with generated code for `TypeScript` and a `crate` with generated code for `Rust` | 3 |
| Requires an additional level of data conversion on the `Rust` side | 4 |

"Impact" is rated from 0 to 5, where 0 indicates weak impact and 5 indicates strong impact. In the context of positive results, 5 means an extremely positive outcome. In the context of negative results, 5 means an extremely negative consequence.

### An additional level of data conversion

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

Given the volume of such operations, transitioning to `protobuf` reduces flexibility and introduces potential error points. Moreover, some types might not match, for example, `usize` is not supported by `protobuf`.

> **Important:** With the use of `JSON`, it isn't an issue as long as we take the structures from the Rust side as the "master" and convert them into `JSON`. In `TypeScript`, we still have to validate the received objects, whether they come via `protobuf` or `JSON`. Therefore, from the TypeScript point of view, there aren't many changes because it doesn't matter much whether we check a `protobuf` message or a `JSON` object.

### proto2 or proto3

| .proto Version | Modifier   | Rust Type                        |
|----------------|------------|----------------------------------|
| proto2         | optional   | `Option<T>`                      |
| proto2         | required   | `T`                               |
| proto3         | default    | `T` for scalar types, `Option<T>` otherwise |
| proto3         | optional   | `Option<T>`                      |
| proto2/proto3  | repeated   | `Vec<T>`                         |

From the perspective of reducing the volume of checks and conversions, it is **more convenient** to use `proto2` because in the `proto3` format, any non-scalar data type will be represented as `Option<T>`. This complicates conversion and can introduce ambiguity, especially in cases where `Option` types are present in the original structure.

### Overview of protobuf related crates

`protobuf` is more oriented towards dynamic handling of messages. It supports working with descriptors and allows dynamic creation of messages. By default, it does not have tools for code generation. Created 9 years ago. Supports: `proto2`, `proto3`.

`prost` is more oriented towards using protobuf with code generation (for which the `prost-build` crate is used). It has a more user-friendly API and allows mapping structures to protobuf message fields (using the `prost` proc-macro). Created 7 years ago. Supports: `proto2`, `proto3`.

`protobuf-serde` allows mapping structs to messages, but the trait is outdated and seems to be not well-supported. It was probably created for a specific project.

### Using serde

Unfortunately, the crate `serde-protobuf` does not offer significant advantages. For instance, the implementation of the serializer is entirely absent; only the deserializer is available.

On the other hand, the crate `prost` provides the ability to map structures to match fields with message fields. An example from the documentation:

```rust
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Person {
    #[prost(string, tag="1")]
    pub name: ::prost::alloc::string::String,
    /// Unique ID number for this person.
    #[prost(int32, tag="2")]
    pub id: i32,
    #[prost(string, tag="3")]
    pub email: ::prost::alloc::string::String,
    #[prost(message, repeated, tag="4")]
    pub phones: ::prost::alloc::vec::Vec<person::PhoneNumber>,
}
```

Clearly, mapping can greatly facilitate the integration of `protobuf`. However, it is important to understand that this is not an absolute solution, as some final structures belong to external crates. Therefore, some amount of "manual" conversion will be present regardless.

Another issue is that when using structure mapping, we must ensure that the message format matches the format in the schema (`*.proto`), as this schema will be used at least for code generation on the `TypeScript` side.

Thus, the application of structure mapping is not straightforward.

### Using binary descriptor

An alternative approach is generating *.desc files (binary protocol description). This method allows us to partially automate the process, but it doesn't eliminate the need to manually convert final types from protocol types (`ObserveOptionsProtoMsg` → `ObserveOptions`). Additionally, it doesn't solve type mismatch issues.

In general using of binary description gives much less props to  how much it gives complexity.

For example, deserialization of message

```
use protobuf::{
    descriptor::{FileDescriptorProto, FileDescriptorSet},
    reflect::MessageDescriptor,
    MessageDyn,
};

fn get_desc() -> FileDescriptorSet {
    protobuf::Message::parse_from_bytes(include_bytes!("path_to_precompiled.desc"))
        .expect("Protocol descriptor is valid")
}

fn find_message_descriptor(fds: &FileDescriptorSet, name: &str) -> Option<MessageDescriptor> {
    for file in &fds.file {
        for message_type in &file.message_type {
            if message_type.name() == name {
                return Some(message_type.descriptor_dyn());
            }
        }
    }
    None
}

fn deserialization(schema: &FileDescriptorSet, bytes: &[u8]) -> Option<Box<dyn MessageDyn>> {
    let msg_desc = find_message_descriptor(schema, "MyMessage")?;
    let mut msg = msg_desc.new_instance();
    msg.merge_from_bytes_dyn(bytes)
        .expect("message is serialized");
    Some(msg)
}
```

Method `deserialization` will give `MyMessage` which also has to be converted into some origin structure. The only one reason is to use descriptors - if it allows using it with serde to make it easier to convert protobuf entity to origin rust structure. But it looks like there are no good solutions for it at the current moment.

## Protobuf cross-platform issues

During the research on the interaction of generated code for *.proto files across different platforms (Rust, JavaScript, TypeScript), it was discovered that protocol implementations for different platforms can produce different sets of bytes for the same message.

For example, the message CallbackEvent::SearchValuesUpdated will be serialized into bytes as follows:

```
Byte's slice:
Python:     [50,30,10,22,08,01,18,18,09,00,00,00,00,00,00,240,63,017,00,00,00,000,00,00,89,64,10,04,08,00,18,00]
Rust:       [50,26,10,00,10,22,08,01,18,18,09,00,00,00,00,000,00,240,63,17,00,000,00,00,00,00,89,64]
JavaScript: [50,30,10,04,08,00,18,00,10,22,08,01,18,18,09,000,00,000,00,00,00,240,63,17,00,00,00,00,00,00,89,64]

HEX:
Python:     32 1E 0A 16 08 01 12 12 09 00 00 00 00 00 00 F0 3F 11 00 00 00 00 00 00 59 40 0A 04 08 00 12 00
Rust:       32 1A 0A 00 0A 16 08 01 12 12 09 00 00 00 00 00 00 F0 3F 11 00 00 00 00 00 00 59 40
JavaScript: 32 1E 0A 04 08 00 12 00 0A 16 08 01 12 12 09 00 00 00 00 00 00 F0 3F 11 00 00 00 00 00 00 59 40

```

It is important to note that the Python and Rust implementations are fully compatible and can successfully process messages from each other as well as from JavaScript. However, the JavaScript implementation throws an error when attempting to read the bytes of a message generated by either Python or Rust.

This issue pertains only to the message mentioned above (all other messages do not cause any problems). However, this alone is enough to evaluate the use of code generated for JavaScript as an "unpredictable" solution.


The following tools were used for generating JavaScript code:

- Protocol Buffers Compiler (**protoc**): The official protocol buffer compiler for generating JavaScript code from .proto files.
- **protobufjs** (pbjs, pbts): A popular JavaScript library for working with protocol buffers, used to parse and serialize the generated JavaScript code.

The code generated using both tools results in an error when attempting to read the `CallbackEvent::SearchValuesUpdated` message from bytes received on the Rust side.

Therefore, it can be concluded that there are compatibility issues between different implementations, which apparently concern primarily maps and tuples.

### WebAssembly

As a workaround to ensure consistency in encoding and decoding data, WebAssembly can be used. Specifically:

1. **Create a Rust crate and generate the protobuf source code based on the *.proto files**:
   - This step involves setting up a Rust project and using the protocol buffer compiler to generate Rust code from your proto files.

2. **Add support for wasm_bindgen**:
   - wasm_bindgen is a library that facilitates high-level interactions between WebAssembly (compiled from Rust) and JavaScript.

3. **Define the types that need to be transferred to JavaScript (mapping ProtobufMessage to a shared JS object)**:
   - Instead of directly passing Protobuf messages such as `protocol::CallbackEvent`, you should pass a list or other suitable structure of `CallbackEvent`.

4. **Generate the wasm module and use it in JavaScript for encoding/decoding messages**:
   - This involves compiling the Rust code to WebAssembly and ensuring the generated module is correctly integrated and used within your JavaScript application for encoding and decoding messages.

By using this approach, only one implementation of the protocol (Rust) is utilized, ensuring accurate encoding and decoding of messages between Rust and JavaScript. This guarantees consistency and compatibility in your application's communication.