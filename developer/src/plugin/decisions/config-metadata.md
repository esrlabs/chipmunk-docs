# Plugins Configurations & Metadata

To ensure essential plugin information remains synchronized with the plugin code, critical metadata and configurations are embedded directly within the plugin binary, rather than stored in separate external files.

## Plugins Name & API Version

The plugin's main interface name and the specific API version of the `WIT` contract it was compiled against are automatically included within the WebAssembly component binary as part of its structure. 
This information is accessible to the host upon inspecting the binary and is used for initial identification and validating API compatibility. 
This feature is also used while adding plugins to infer the type of the plugins without having the users to set them explicitly.

## Plugins Configurations

Critical configuration-related metadata, including the plugin's own version, its configuration schema, and rendering options, are exposed through dedicated static functions defined within the plugin's `WIT` contract. The Chipmunk host retrieves these details by loading the plugin binary and calling these specific functions. 
Embedding this information directly in the binary prevents it from falling out-of-sync with the plugin's code, which is crucial for reliable operation. 
A caching mechanism is employed by the host to efficiently access this embedded metadata.


## Optional Metadata

Certain non-essential metadata is stored externally alongside the plugin binary. This includes the plugin's **title** and **description**, which are provided in an optional `TOML` file. Detailed documentation is included in a file named **`README.md`**, which can be rendered within the application interface. 
This information is kept separate because it is not strictly required for the plugin's core functionality or host validation, making external storage convenient for management without risking core synchronization issues.
