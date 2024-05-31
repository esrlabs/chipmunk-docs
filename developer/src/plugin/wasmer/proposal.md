# Plugin Proposal

* The plugin framework is based on the `wasmer` runtime and it's related modules. 
* It should seemingly integrate to Chipmunk's current architecture and data processing logic.
* Different types of plugins for the diverse core components, such as the `ByteSource` and `Parser` will be used.
* For communication between host and plugins a FFI-save RPC mechanism will be used based on the `rkyv` serialization framework.
* A prototype provides a proof-of-concept and performance considerations of this approach.

## Architecture of the Plugin Framework

* Each plugin type (or `Chipmunk Extension`) is represented by a `Plugin Proxy` for the related Trait (such as `ByteSource` and `Parser`) within the host application.
* A new `Plugin Proxy` can be instantiated on demand from a corresponding `Plugin Factory` which provides the underlying infrastructure for eg. plain `wasm` plugins or plugins requiring the `wasi` system interface.
* A `Plugin Registry` (or `Plugin Runtime` with lifecycle for eg. async RPC) could provide the factories for the plugins by configuration.

### Motivations

* Generic implementations of the `Plugin Factory` types, wich will be instantiated with different pre-compiled WebAssembly modules for each corresponding plugin.
* Specialized implementations of the `Plugin Proxy` types, to reflect the individual needs of the proxy to integrate with the host architecture.

### Limitations

* The prototype is neglecting any configuration of the plugin framework and only contains hard coded insertions of the plugins in certain areas of the host for a `BinaryByteSource` and the `DltParser`.
* The prototype contains some known issues on memory management and integration within the host data processing.
    * The maximum data transfer to the `wasmer` runtime per call had to be limited to `DEFAULT_READER_CAPACITY = 512 * 1024`.
    * The path of the input file for processing was hard coded as `temp.dll` within the working directory.
    * The source plugin, tries to emulate the native buffered reading of data chunks and could be optimized to avoid an additional buffering of the data within the plugin.
        * TBC: Some complex byte-sources, such as eg. for the `MDF` file format, could actually need internal buffering for the `MDF` specific pre-parsing of data-blocks.
    * The source plugin used together with a native parsers currently seems to fail on some conditions, eg. different input files.
        * TBC: Means to improve plugin robustness and host processing integration.
    * With both source and parser plugin running, for each bulk processing of a data chunk a possible parse error at end of the chunk due incomplete data can trigger the remaining bytes of the chunk to being dropped by the `Message Producer`. 
        * TBC: Means to avoid the dropping of bytes and continued reloading from the source in this cases.
