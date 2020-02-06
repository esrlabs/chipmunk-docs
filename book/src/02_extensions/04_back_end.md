# Back-end

The files for the back-end are all located in the folder `sandbox`. The back-end can either contain a standalone plugin, or the back-end part of a complex plugin.
The standalone plugin serves as a render plugin, which formats the output shown in the output window. There won't be a UI for this kind of plugin.
The back-end of a complex plugin is there to use either 3rd-party libraries or to read/write configurations.

An example for the complex plugin would be the `Serial plugin`, which uses the `serialport` library to communicate with serial ports. The connection state, received and sent amount and other information is then forwarded to the front-end (more about it in **Communication between back-end and front-end** below).


The code snippet below shows the hierarchy of the `sandbox` folder. The text behind the `//` serve as comments for a better understanding what the folders or files contain. --The files of the template plugin **myplugin** will all be listed to get a general idea of the plugin.

```
sandbox                                     // Contains files of back-end part of plugins
|__ dlt                                     // DLT plugin
|__ dlt-render                              // DLT-render plugin
|__ myplugin                                // Example plugin to modify for developer
|   |__ process
|   |   |__ dist                            // Contains compiled files
|   |   |__ node_modules                    // Node modules
|   |   |__ src
|   |   |   |__ service
|   |   |   |   |__ service.example.ts      // Test class with main functionality of the plugin
|   |   |   |__ env.logger.parameter.ts     // Logger Parameter class
|   |   |   |__ env.logger.ts               // Logger class for back-end
|   |   |   |__ main.ts                     // Main file of the plugin
|   |   |__ package.json                    // JSON file with information about the plugin and dependencies
|   |   |__ tsconfig.json                   // Configuration file for Typescript
|   |__ render                              // Compiled files
|__ processes                               // Processes plugin
|__ row.parser.ascii                        // Row parser ASCII plugin
|__ serial                                  // Serial plugin
|__ xterminal                               // xTerminal plugin
```

## Configure plugin

The main file which cotains all necessary files and functions for the plugin to work in the back-end is defined as `main.ts`. The back-end of **myplugin** does not do much except for establishing the communication between the front- and the back-end. For the usage, the **main file** of the plugin requires the following lines (already implemented in **myplugin**):

## chipmunk.plugin.ipc

The `chipmunk.plugin.ipc` grants access to a wide range of classes and methods, of which only two are going to be described in this documentation: `PluginIPC` and `ServiceConfig`. A deeper explanation of `PluginIPC` as well as an example can be found in the _Communication front-end back-end_ section. `ServiceConfig` will be described in the _Configuration file_ section as well as an example.
To see all classes of `chipmunk.plugin.ipc` refer to `sandbox/serial/process/node_modules/chipmunk.plugin.ipc/dist/node.libs/chipmunk.plugin.ipc/src/index.d.ts`.

## Logging

To log any kind of errors or warnings in the back-end instantiate the logger which is imported locally with a signature and optionally with parameters (more about that in `env.logger.ts`). The logged messages will be shown in the console along with timestamp and where the event happened. 

``` typescript
private _logger: Logger = new Logger('MyPlugin');
```

## Configuration file
As mentioned in **chapter 3** as well as in the `chipmunk.plugin.ipc` section, it is possible to read from a configuration file as well as write into it with the help of the `ServiceConfig` class.  
`ServiceConfig` provides a variety of methods such as `read` (return settings of the configuration file) or `write` (save settings in the configuration file).

To see all methods refer to `sandbox/myplugin/process/node_modules/chipmunk.plugin.ipc/dist/node.libs/chipmunk.plugin.ipc/src/services/service.config.d.ts`.

## Communication front-end back-end

`PluginIPC` provides methods to establish the communication between the front- and back-end. For a better explanation of how to communicate, code snippets of `main.ts` are being shown.  

Aside from importing the necessary components, it is also important subscribe to the events with a method which handles the message traffic.

``` typescript
import PluginIPCService from 'chipmunk.plugin.ipc';                                                                                 // Plugin IPC
import { IPCMessages } from 'chipmunk.plugin.ipc';                                                                                  // Class to create messages

...

    constructor() {
        this._onIncomeRenderIPCMessage = this._onIncomeRenderIPCMessage.bind(this);                                                 // Bind the function the will receive the messages from the front-end
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncomeRenderIPCMessage);                              // Subscribe to the messages from the front-end
    }

    private _onIncomeRenderIPCMessage(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {   // Function that will handle the incoming messages
        ...
    }
```

The method that takes care of the messages is `_onIncomeRenderIPCMessage`, which then decides which action is to being taken in comply with the commmand.
In **chapter 3** was a reference to two buttons which either send or make a request to the back-end.
In accordance to the _request_ that is being made by the front-end, the back-end responds with a message back to the front-end containing a string.
Similar to the _request_, upon receiving _sent_ as a command from the front-end, the back-end creates a new message and also sends a message containing a string without expecting a response from the front-end.

``` typescript
private _onIncomeRenderIPCMessage(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {
    // Process commands
    switch (message.data.command) {
        case 'request':
            return response(new IPCMessages.PluginInternalMessage({         // Respond to the request from the front-end
                data: {                                                     // data can contain any kind of data to be sent
                    msg: '\'request\' was successful!'                      // Attach a message to the response
                },
                token: message.token,
                stream: message.stream
            }));
        case 'sent':                                                        // Send a message to the front-end without expecting any kind of response
            return PluginIPCService.sendToPluginHost(message.stream, {
                data: {
                    msg: '\'sent\' was successful!'
                },
                event: 'sent',
                streamId: message.stream
            })
        default:
            this._logger.warn(`Unknown command: ${message.data.command}`);
    }
}
```

For a better understanding and deeper insight of `PluginIPC` refer to `sandbox/myplugin/process/node_modules/chipmunk.plugin.ipc/dist/node.libs/chipmunk.plugin.ipc/src/ipc/plugin.ipc.service.d.ts`.

## How to build back-end

To build a `Standalone` plugin or the back-end part of a `Complex` plugin, it is necessary to include the following line in `application/client.plugins/package.json` (in the **"scripts:"**-section):

`"build:myplugin": "./node_modules/.bin/ng build myplugin"`

After inserting the line, change directory into `sandox/myplugin/process` and run `npm run build`.

## Errors

Errors that appear upon building the plugin will appear in the command line, in which the command to build has been called.

A common issue known is, that changes made in the back-end are not being applied, even though the back-end has been compiled without any errors.
To resolve this issue, simply **delete** the `dest` folder located in `sandbox/myplugin/process/dist` and compile the plugin again.
