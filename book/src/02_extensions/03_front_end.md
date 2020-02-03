# Front-end

The files for the front-end are all located in the folder `client.plugins`. The front-end defines the part of the application, with which the user can interact directly. The files mainly consist of HTML, CSS and Typescript files. It's important to know, that plugins for the front-end are from the Angular type.

The code snippet below shows the hierarchy of the pulled folder mentioned in the first chapter. The text behind the `//` serve as comments for a better understanding what the folders or files contain. The files of the template plugin **myplugin** will all be listed to get a general idea of the plugin.

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

## Configure plugin

The looks of the plugin can be changed by simply configuring the `template.html` and `styles.less` files. The functions for the `template.html` can be defined in `component.ts`, which is the main file of the plugin.
The different options and libraries provided to the front-end will be described in the following paragraphs.

## API

The api is an essential part of the front-end implementation. Chipmunk provides an `API` out of the box, which can be easily used. For the usage, the main component file of the plugin requires the following lines (already implemented in **myplugin**):

``` typescript
import * as Toolkit from 'chipmunk.client.toolkit';

@Input() public api: Toolkit.IAPI;                          // Assignment of the api into class variable
@Input() public session: string;                            // Assignment of session id (necessary for communication FE <-> BE)
@Input() public sessions: Toolkit.ControllerSessionsEvents; // Assignment of all sessions (necessary for session states)
```

The `API` grants access to a variety of methods, of which a few will be listed below. To see all methods open the file `/client.plugins/node_modules/chipmunk.client.toolkit/dist/interfaces/api.d.ts`

## Logging

To log any kind of errors or warnings in the front-end instantiate the logger provided by the `api` with a signature. The logged messages will be shown in the console along with timestamp and where the event happened. For more details please check out the path of the `api` mentioned above. 

``` typescript
private _logger: Toolkit.Logger = new Toolkit.Logger(`Plugin: myplugin: inj_output_bot:`);
```

## Pre-defined components

Chipmunk also provides a variety of pre-defined components which can be used for plugin creation for example. The components are divided into complex, containers and primitive. Highly used HTML elements such as e.g Button, Checkbox or Input are located In primitive and can be used by importing the corresponding class.

```
|___application
    |___client.libs
        |___chipmunk.client.components.ts
            |___projects
                |--- chipmunk-client-complex
                |--- chipmunk-client-containers
                |___ chipmunk-client-primitive
```

To use the components in the plugin, open the `module.ts` file of the plugin `/client.plugins/projects/myplugin/src/lib/module.ts`. The components can then be used in the `template.html` of **myplugin**. For more details please check out `/application/client.libs/chipmunk.client.components/projects/chipmunk-client-primitive/src/lib`.

``` typescript
import { NgModule } from '@angular/core';
import { MypluginComponent } from './component';
import { PrimitiveModule } from 'chipmunk-client-primitive';	// Import the primitive modules (example)
import * as Toolkit from 'chipmunk.client.toolkit';

@NgModule({
    declarations: [MypluginComponent],
    imports: [ PrimitiveModule ],                               // Bind them into the plugin by defining them as imports
    exports: [MypluginComponent]
})

export class PluginModule extends Toolkit.PluginNgModule {
    constructor() {
        super('MyPlugin', 'Creates a template plugin');
    }
}
```

## Notifications

Another feature the `api` provides is notifying. Notifications can be created which will pop up at the bottom right of Chipmunk and can be found afterwards in the notifications box at the bottom of Chipmunk. It's important to know that using the notifications as well as all other functionalities provided by `api` is only possible in the front-end.

Example:
``` typescript
import { ENotificationType } from 'chipmunk.client.toolkit';    // For notification type

this.api.addNotification({
    caption: 'Info',                                            // Caption of the notification
    message: 'You just got notified!',                          // Message of the notification
    options: {
        type: ENotificationType.info                            // Notification type
    }
});
```

## Configuration file

If specific settings need to be remembered even after shutting down Chipmunk, the `chipmunk.plugin.ipc` offers a way to write and read from a **.txt** file, which serves as a configuration file. The methods to reach the configuration file are part of the back-end. If anything from the front-end needs to be written into the configuration file, a request with the **API** needs to be made. Further explanation can be found in the following chapter **Back-end**.

## Communication front-end back-end

Creating a complex plugin requires some way of communication between the front- and the back-end. For that the `api` provides two kind of functions.
One way is to send a request and await some kind of response from the back-end, for example reading the content of a configuration file, the content can be sent as a response from the back-end to the front-end.
The other way is to send without expecting any kind of response, an example for this would be `startSpy` from the serial plugin. `startSpy` sends a command to the back-end to connect to all available ports and listen to check for the activity of the ports.

Example:
```typescript
// Sending and expecting a response
this.api.getIPC().requestToHost({
    stream: this.session,
    command: 'test',
}, this.session).then((response: any) => {
    this.logger.info(`Received from the back-end: ${response}`);
}).catch((error: Error) => {
    this.logger.error(`Failed to send request due to error: ${error.message}`);
});

// Sending without expecting a response
this.api.getIPC().sentToHost({
    stream: this.session,
    command: 'test2',
}, this.session).catch((error: Error) => {
    this.logger.error(`Failed to send message due to error: ${error.message}`);
});
```

`myplugin` has two buttons whereas one of them makes a request and the other one sends to the back-end.

## How to build front-end

Building the plugin can be made in two ways, either by building the plugin or the whole application. To only build the plugin, it requires to create a new command in the rakefile (which can be found in the **main folder of Chipmunk**) under `namespace :dev do`.

``` typescript
task :myplugin_render do
    install_plugin_angular('myplugin')
end
```
To run the command simply type `rake dev:myplugin_render`.

To build the whole application it is also necessary to mention the plugin in its respective category (As mentioned in *chapter_1*:Angular/Standalone/Complex), which needs to be done in:

``` ruby
COMPLEX_PLUGINS = %w[
  serial
  processes
  xterminal
].freeze
ANGULAR_PLUGINS = ['dlt-render'].freeze
STANDALONE_PLUGINS = ['row.parser.ascii'].freeze
```

## Errors

Errors that appear upon building the plugin will either appear in the command line, in which the command to build has been called. Errors that occur on runtime will appear in the console of the debugger (only visible if debugger mode active).


In the following chapter the back-end will be explained as well as the communication between the front- and back-end will be continued. 