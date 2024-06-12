# Overview

Regardless of which architecture is chosen for the next generation of chipmunk (v.4), whether it is a comprehensive platform involving different ecosystems (nodejs, rust, wasm) or a single platform with a unified ecosystem, the question of protocol remains extremely important, as the application will inevitably have components that require communication.

The need for a protocol becomes particularly acute in the context of chipmunk transitioning to plugin support.

## Criteria for Selection

- **Binary** — the protocol must operate with binary data. This is important for saving traffic; independence from data format (a known issue with non-UTF characters); fast data transmission.
- **Performance** — the performance of the protocol is extremely important, especially in the context of its use in data streams.
- **Availability of libraries in all languages important to the project** — key languages are Rust and JavaScript. However, considering plugin support, it is important to support languages that potential plugins may be written in. Furthermore, protocol-related solutions should integrate seamlessly with wasm.
- **Stable protocol support** — preference should be given to protocols supported either by large companies or large communities.
- **Prevalence** — considering plans for plugin support, preference should be given to protocols familiar to developers.

> **Note**: When talking about performance, it is important to remember that whatever protocol is chosen, it will improve performance compared to JSON used in the current version.

> **Note**: Developing a custom protocol may seem appealing, but it could entail maintenance difficulties and challenges for plugin developers.

## Most Prevalence Protocols

| Protocol         | Date of Foundation | Version | Developer              | GitHub Link                                               | Main Application Area             | Stars | Forks |
|------------------|--------------------|-----------------|------------------------|-----------------------------------------------------------|-----------------------------------|-------|-------|
| Protocol Buffers | 2008               | v3         | Google                 | [protobuf](https://gith.19.1ub.com/protocolbuffers/protobuf)    | Communication, microservices, RPC | 64K   | 15K   |
| Cap'n Proto      | 2013               | v0.8          | Kenton Varda           | [capnproto](https://github.com/capnproto/capnproto)        | High-performance systems, RPC     | 11K   | 900   |
| MessagePack      | 2013               | v1          | Sadayuki Furuhashi     | [msgpack](https://github.com/msgpack/msgpack)              | Web, microservices, cross-language communication | 7K   | 500   |
| FlatBuffers      | 2014               | v2         | Google                 | [flatbuffers](https://github.com/google/flatbuffers)       | Game industry, real-time systems, high-performance systems | 22K   | 3K   |
| BSON             | 2009               | v4          | MongoDB, Inc.          | [bson](https://github.com/mongodb/bson-rust)               | Databases, MongoDB               | 400   | 100   |
| CBOR             | 2013               | RFC 8949        | IETF                   | [cbor](https://github.com/intel/tinycbor)                  | Embedded systems, IoT            | 500   | 200   |
| Avro             | 2009               | v1         | Apache Software Foundation | [avro](https://github.com/apache/avro)                 | Big Data, data storage systems    | 3K   | 1.5K   |
| UBJSON           | 2011               | -               | Noah Watkins, Markus Kuhn | [ubjson](https://github.com/ubjson/universal-binary-json) | Web, cross-language communication | 100   | 10   |
| FlexBuffers      | 2015               | v1         | Google                 | Part of flatbuffer | Real-time systems, dynamic data structures | -   | -   |


## Programming language support

| Protocol         | Rust | Java | C | C++ | JavaScript | Python | Scala | Go |
|------------------|------|------|---|-----|------------|--------|-------|----|
| Protocol Buffers | X    | X    | X | X   | X          | X      | X     | X  |
| Cap'n Proto      | X    | X    | X | X   |            | X      |       | X  |
| MessagePack      | X    | X    | X | X   | X          | X      | X     | X  |
| FlatBuffers      | X    | X    | X | X   | X          | X      |       | X  |
| BSON             | X    | X    | X | X   | X          | X      |       | X  |
| CBOR             | X    | X    | X | X   | X          | X      |       | X  |
| Avro             | X    | X    | X | X   | X          | X      | X     | X  |
| UBJSON           |      | X    |   |     | X          | X      |       | X  |
| FlexBuffers      | X    | X    | X | X   |            | X      |       | X  |

## Technical overview

| Protocol         | Requires Schema | Requires Code Generation | Processing Model            |
|------------------|-----------------|--------------------------|-----------------------------|
| Protocol Buffers | Yes             | Yes                      | Serialization/Deserialization |
| Cap'n Proto      | Yes             | Yes                      | In-place Memory Access        |
| MessagePack      | No              | No                       | Serialization/Deserialization |
| FlatBuffers      | Yes             | Yes                      | In-place Memory Access        |
| BSON             | No              | No                       | Serialization/Deserialization |
| CBOR             | No              | No                       | Serialization/Deserialization |
| Avro             | Yes             | Yes                      | Serialization/Deserialization |
| UBJSON           | No              | No                       | Serialization/Deserialization |
| FlexBuffers      | No              | No                       | In-place Memory Access        |

## Performance and trafic
| Protocol         | Processing Speed | Package Size |
|------------------|------------------|--------------|
| Protocol Buffers | 2                | 3            |
| Cap'n Proto      | 3                | 3            |
| MessagePack      | 2                | 3            |
| FlatBuffers      | 3                | 3            |
| BSON             | 1                | 1            |
| CBOR             | 2                | 2            |
| Avro             | 1                | 2            |
| UBJSON           | 1                | 2            |
| FlexBuffers      | 3                | 3            |

- `Processing Speed`: 1 has slowest protocol; 3 - fastest;
- `Package Size`: 1 has protocol with biggest packages; 3 has protocol with most compact packages; 

> **Note**: This is not an entirely accurate estimation, as both parameters depend on many factors such as data complexity, platform, etc. However, this estimation allows for comparison between protocols. Prepared with ChatGPT.

## Conclusion

It is necessary to distinguish between two groups of protocols based on their data handling principles:

- In-place Memory Access
- Serialization/Deserialization

The performance difference is not uniformly distributed. For example, there might be a significant gain during decoding (and thereafter), but it may not be as obvious during encoding due to the additional steps needed to safely prepare data for subsequent decoding. Nevertheless, the first model is generally more efficient.

However, in the context of chipmunk, the performance difference between these two models is not significant, as chipmunk does not perform operations requiring "instant" reactions.

Thus, the protocol's working model cannot be a decisive factor.

What plays a significant role in the context of chipmunk are:
- Support for multiple programming languages
- The prevalence of the protocol (making it more accessible for plugin developers)
- Long-term and stable support for the protocol itself

From this perspective, the obvious favorites are **protobuf** and **flatbuffer**.

## Transition to Protocol Usage

In the current version of chipmunk, data validation is performed:
- On the Rust side: through serialization/deserialization of data (serde), as well as part of the data being transferred to the JavaScript ecosystem as ready-made JavaScript objects.
- On the JavaScript side: received objects undergo additional validation from the ts-binding level to the client.

Thus, the current version already has validation tools that ensure the security of data transfer and processing. A comprehensive refactoring and transition to **protobuf** or **flatbuffer** seems unnecessary, as it would entail changing the entire communication chain between all components of the application (e.g., IPC (client ↔ electron) would need to be completely updated). However, where necessary, the **MessagePack** protocol can be safely integrated, allowing the avoidance of unsafe JSON with minimal changes to the current codebase.

However, the next generation of chipmunk should initially adopt **protobuf** or **flatbuffer** as the base protocol, allowing for complete abandonment of "manual" data validation at all levels of the application.
