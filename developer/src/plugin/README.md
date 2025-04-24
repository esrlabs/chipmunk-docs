# Plugins for chipmunk

## Requirements:

* The plugin system is designed to allow integration of new data protocols and formats, extending Chipmunk's native parsing capabilities. Plugins can also provide alternative sources for data beyond the standard files and network streams.
* It should also be possible for a plugin to act as both the data source and the parser simultaneously, handling scenarios like reading and parsing data directly from a database.
* Plugins are expected to have performance characteristics similar to native components to maintain overall application responsiveness.
* For enhanced stability and security, plugins should be sandboxed wherever technically feasible.

