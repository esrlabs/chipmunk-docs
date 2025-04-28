# Caching

To minimize the performance impact associated with loading and validating plugin binaries on every Chipmunk startup, a caching mechanism has been implemented.

Loading and validating all plugin binaries each time Chipmunk starts introduced undesirable overhead and forced the initialization of the WebAssembly runtime even in sessions where plugins were not used. The caching system is designed to address these issues.

The mechanism operates by storing essential plugin information, specifically the embedded metadata and configurations, in a `.cache` file within the plugins directory, using `JSON` format. Alongside this data, a hash of the plugin binary file is computed and saved.

On subsequent application startups, Chipmunk checks the cache file. If an entry exists for a plugin and the current binary's hash matches the cached hash, the plugin's metadata and configuration are loaded directly from the cache. The plugin binary is only loaded and fully validated if no cache entry is found or if the binary's hash has changed. This approach ensures that each plugin binary is processed only once unless it is updated, significantly improving startup performance and avoiding unnecessary Wasm runtime initialization.

This caching method provides a simple yet effective solution that is sufficient for our current requirements.
