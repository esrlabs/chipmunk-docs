# Front-end

## Logging

To log errors and warnings in the front-end, import `chipmunk.client.toolkit` and instantiate the logger with a signature:

``` typescript
import * as Toolkit from 'chipmunk.client.toolkit';

...

private _logger: Toolkit.Logger = new Toolkit.Logger(`Plugin: myplugin: inj_output_bot:`);
```

## API

The api is an essential part of the front-end implementation. Chipmunk provides an API out of the box, which can be easily used. For the usage, the main component file of the plugin needs the following lines (already implemented in **myplugin**):

``` typescript
@Input() public api: Toolkit.IAPI;                          // Assignment of the api into class variable
@Input() public session: string;                            // Assignment of session id (necessary for communication FE <-> BE)
@Input() public sessions: Toolkit.ControllerSessionsEvents; // Assignment of all sessions (necessary for session states)
```

`api` grants access to a variety of methods, of which a few will be listed below. To see all methods open the file `/client.plugins/node_modules/chipmunk.client.toolkit/dist/interfaces/api.d.ts`

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

To use the components in the plugin, open the `module.ts` file of the plugin `/client.plugins/projects/myplugin/src/lib/module.ts`

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

If the user needs to be informed about any errors or warnings, `chipmunk.client.toolkit` provides an interface called **IAPI**. With the interface (beside many other things) notifications can be created, which will pop up at the bottom right of Chipmunk and can be looked up afterwards in the notifications box at the bottom of Chipmunk. The notfications can only be used in the front-end of plugins. 

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

If specific settings need to be remembered even after shutting down Chipmunk, the `chipmunk.plugin.ipc` offers a way to write and read from a **.txt** file, which serves as a configuration file. The methods to reach the configuration file are part of the back-end. If anything from the front-end needs to be written into the configuration file, a request with the **API** needs to be made. Further explanation will be found in chapter 3.

## Communication front-end to back-end

There are two common ways of communication from the front-end to the back-end. One way is to send a request and await some kind of response from the back-end, for example reading the content of a configuration file, the content can be sent as a response from the back-end to the front-end. The other way is to send as a broadcast without awaiting any kind of response, an example for this would be `startSpy` from the serial plugin. `startSpy` sends a command to the back-end to connect to all available ports and listen to check for the activity of the ports.

Example:
``` typescript
// Sending and awaiting a response
this.api.getIPC().requestToHost({
    stream: this.session,
    command: 'test',
}, this.session).then((response: any) => {
    this.logger.info(`Received from the back-end: ${response}`);
}).catch((error: Error) => {
    this.logger.error(`Failed to send request due to error: ${error.message}`);
});

// Sending without awaiting a response
this.api.getIPC().sentToHost({
    stream: this.session,
    command: 'test2',
}, this.session).catch((error: Error) => {
    this.logger.error(`Failed to send message due to error: ${error.message}`);
});
```