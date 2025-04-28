# API Versioning

To manage API breaking changes while maintaining compatibility, our approach relies on providing separate WIT files for each API version. This is necessary because each WebAssembly component plugin is compiled against and strictly validated against a specific WIT contract, making it impossible to embed multiple API versions or incompatible changes within a single WIT file.

This strategy implies that introducing a new API version effectively requires a new set of WIT files. Once an API version is officially published and in use, it is considered immutable; any future breaking changes necessitate defining a completely new API version with its corresponding WIT files.

On the host side, Chipmunk can be built to support multiple past and current API versions by including the necessary bindings and implementation logic for each. When loading a plugin binary, the host first determines the plugin's API version (which is embedded metadata) and then routes subsequent interactions to the matching host-side implementation designed for that specific version.

While this architecture leads to increased code volume on the host due to the need for potentially maintaining code for multiple versions, it provides fine-grained control over version compatibility. A key advantage is the early detection of unsupported or incompatible API versions during the initial plugin loading and validation phase, preventing runtime errors and ensuring system stability.

For Rust plugin authors, the `plugins_api` crate simplifies adherence to specific API versions by mapping crate versions to corresponding API versions. This means developers typically only need to update their crate dependency to target a new API version.
