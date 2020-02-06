# Extending chipmunk with plugins
In this section the basics of plugins will be covered as well as how to create a custom plugin for **Chipmunk**.

## Plugin types
To create a plugin, it's necessary to understand what types of plugins exist on **Chipmunk**. There are **3** different types of plugins that already exist on **Chipmunk**:

1. **Angular**      (DLT-Render)
2. **Standalone**   (row.parser.ascii)
3. **Complex**      (Serial, Processes, xTerminal)

### Angular
Plugins in the **Angular** category provide a UI at the front-end in **Chipmunk** with which the user can interact directly with **Chipmunk**. Angular plugin only consist of a front-end and no back-end.

### Standalone
Plugins in the **Standalone** category only provide functionality in the back-end of the application and don't have a UI. An example for this would be the text coloring in the output window, which can be achieved by searching for specific terms or phrases. The **row.parser.ascii** plugin takes the lines of the search results and renders those with colors.

### Complex
Plugins in the **Complex** category provide both a UI and functionality in the back-end. The idea in these kind of plugins is to provide the front-end with the necessary data from the back-end when any external sources are requested. The Serial plugin provides a UI for the user in which ports can be selected and connected to. The connection is being established in the back-end by making use of an external library and informs the front-end about the result of the connection attempt.

## How to create a plugin
One way of creating plugins is to pull the latest version of the plugins from Github **(link coming soon)**. In the plugins folder there will be a template plugin called **myplugin**. The template is provided to save the trouble with all the pre-work and setup. The template plugin will be a complex type of plugin, but can be changed into any kind of plugin.

The creation of a plugin will be further explained in the following chapters, starting with the basics. 