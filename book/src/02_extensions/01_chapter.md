# Extending chipmunk with plugins

In this section, we'll cover how to extend chipmunk with custom plugins.

## Plugin types
To create a plugin, it's necessary to understand what types of plugins exist on Chipmunk. There are **3** different types of plugins that exist on Chipmunk, which can be implemented:

1. **Angular**      (DLT-Render)
2. **Standalone**   (row.parser.ascii)
3. **Complex**      (Serial, Processes, xTerminal)

### Angular
Plugins in the **Angular** category provide a UI at the front-end in Chipmunk with which the user can interact directly with Chipmunk.

### Standalone
Plugins in the **Standalone** category only provide functionality in the back-end of the application and don't have a UI. An example for this would be the text coloring in the output window, which can be achieved by searching for specific terms or phrases. **The row.parser.ascii** plugin takes the lines of the search results and renders those with colors.

### Complex
Plugins in the **Complex** category provide both a UI and functionality in the back-end. The idea in these kind of plugins is to provide the front-end with the necessary data from the back-end when any external sources are requested. The Serial plugin provides a UI for the user in which ports can be selected and connected to. The connection is being established in the back-end by making use of an external library and informs the front-end about the result of the connection attempt.

## How to create a plugin
To create a plugin, pull the latest version of the plugins from Github **(link coming soon)**.
A dummy plugin is already provided to not trouble developers with all the pre-work to be done.

The graphic below shows the hierarchy of the plugin files in the front-end with a deeper look into the **myplugin** plugin. **myplugin** is a dummy plugin to help developers creating a plugin without much pre-work.

```
client.plugins                              // Contains files of front-end part of plugins
|__ dist                                    // Compiled files of plugins
|__ e2e
|__ node_modules                            // Node modules
|__ projects                                // Contains all plugins
|   |__ dlt                                 // DLT plugin
|   |__ dlt-render                          // DLT-render plugin
|   |__ myplugin                            // Example plugin to modify for developer
|   |   |__ src
|   |   |   |__ lib
|   |   |   |   |__ components.ts           // Defines functionality of plugin and communication between front-end and back-end
|   |   |   |   |__ module.ts               // Manages import and export of modules for the plugin
|   |   |   |   |__ styles.less             // Configuration of CSS attributes of plugin UI
|   |   |   |   |__ template.html           // Visual configuration of UI
|   |   |   |__ public_api.ts               // Interface to manage relevant files for compilation
|   |   |   |__ test.ts                     // Auto generated test file
|   |   |__ ng-package.json                 // JSON file to build plugin
|   |   |__ package.json                    // JSON file with information about the plugin and dependencies
|   |   |__ tsconfig.lib.json               // JSON file with compiler options and configurations
|   |   |__ tsconfig.spec.json              // JSON file extension to tsconfig.lib.json with .spec files for test
|   |   |__ tslint.json                     // JSON file with tslint options
|   |__ processes                           // Processes plugin
|   |__ serial                              // Serial plugin
|   |__ xterminal                           // xTerminal plugin
|__ src
|__ theme                                   // Collection of .less files for CSS configuration
|__ .editorconfig
|__ .gitignore
|__ angular.json
|__ package.json
|__ README.md
|__ tsconfig.json                           // Configuration file for Typescript
|__ tsling.json                             // Configuration file for TSLint
```