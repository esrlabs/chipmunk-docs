# Stand-alone Producer & Parser and Source Composition

* The component model provides tools to compose many plugins together, resolving their dependencies to produce one plugin with combined from capabilities.
* With the approach we can compose the parser and the source plugins with an additional buffering plugin to produce a unified plugin that accepts read and parse configuration as input then it reads the data, process them returning results to the host.
* In this scenario, the host must replace the whole producer functionality in the native code, as all processing logic is encapsulated within the plugin.
* The same `wit` API and host implementation can be utilized with stand-alone producers too which can be useful for `MDF` file format.

## Current Prototype:

* For prototyping purposes, a plugin has been provided that reads the source and offers basic buffering functionality. It then calls a method to parse the data after it has been read and buffered..
* After compiling the plugin, it can be composed  with any parser plugin using [WebAssembly Compositions (WAC)](https://github.com/bytecodealliance/wac) CLI tool to produce one producer plugin.
* Composing command: 
```bash, ignore
wac plug --plug {path_to_parser_wasm_file} -o {output_file.wasm} {path_to_source_producer_wasm_file}
```
* On the host side the plugin wrapper provides similar functions like the producer, which is a function to provide stream of parse results.
* Replacing Producer with this Prototype for DLT files results in performance that is about 1.32x than the native one (30% slower).
* The current implementation is just for prototyping purposes here and stills far away from the real-world implementation.

## WIT File

```wit, ignore
// *** Data Types & Traits Definitions ***
interface parsing { ... }
interface parse-client { ... }
interface sourcing { ... }

interface source-prod-client {
  use sourcing.{source-error};
  use parsing.{};
  use parse-client.{parser};

  // Trait that initialize a parser source, reads and buffers the data,
  // then call parse on them.
  resource source-prod{
    constructor();
    init: func(config-path: string, file-path: string) -> result<_, source-error>;
    read-then-parse: func(len: u64, bytes-read: u64, timestamp: option<u64>) -> result<_, source-error>;
  }
}

// State that the plugin must provide `soruce-prod` implementation in this world
world producer {
  export source-prod-client;
}
```
