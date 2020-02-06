# Front-end - Angular Plugin

**Angular** plugins are located in the **front-end** of the application in the folder `client.plugins`. An **Angluar** plugin can either be a plugin by itself or be part of a **Complex** plugin.
The main characteristic of a **front-end** plugin is the ability to interact with the user directly. **front-end** plugins mainly consist of HTML, CSS and Typescript files, whereas the Typescript files include, inter alia, Angular. The files of the **front-end** are located in the `client.plugins` folder. 

## Example

This section explains how to create a simple plugin with a line of text and a button that prints `'Hello World!'` in the console:

### Visual
Since the **front-end** is being created with Angular, the plugin is treated like a component. To shape the visual part of the plugin, configure the `template.html` file (holds the HTML components) and `styles.less` file (holds the style settings).

`template.html - HTML`
``` HTML
<p>Example</p>                          <!-- Create a line of text -->
<button (click)="_ng_click"> </button>  <!-- Create a button with a method to be called from the components.ts file -->
```

`styles.less - LESS`
``` CSS
p {
    color: #FFFFFF;
}

button {
    height: 20px;
    width: 50px;
}
```

### Functionality
The HTML elements can be attached with any kind of functions, which need to be configured in the `components.ts` file.

`components.ts - Typescript, Angular`
``` typescript
import { Component } from '@angular/core';  // Import the Angular component that is necessary for the setup below

@Component({
    selector: 'example',                    // Choose the selector name of the plugin
    templateUrl: './template.html',         // Assign HTML file as template
    styleUrls: ['./styles.less']            // Assign LESS file as style sheet file
})

export class ExampleComponent {             // Create an example class for the method
    public _ng_click() {                    // Create a method for the button in template.html
        console.log('Hello World!');        // Initiate a console output
    }
}
```

### External libraries
To expand the range of classes and methods the `example` plugin can make use of, modify the `module.ts` file.

`module.ts - Typescript, Angular`
``` typescript
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { Example } from './component';                      // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit

@NgModule({
    declarations: [ Example ],                              // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ Example ]                                    // Provides services that the other application components can use
})

export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
```

> IMPORTANT: Make sure the `PluginModule` class inherits from `Toolkit.PluginNgModule` or else the modules won't be part of the plugin!


#### Library management
The library management of the plugin is defined in `public_api.ts` which manages and exports the public definitions of the plugin. In this example only the `module.ts` and `component.ts` files are being exported.

`public_api.ts - Typescript`
```typescript
export * from './lib/component';    // Export the main component of the plugin
export * from './lib/module';       // Export the module file of the plugin
```

> IMPORTANT: Exporting the component and module is required by Angular and necessary for the plugin to work!

## Popup

To create and remove popups, the `API` is required. **Chipmunk** provides an `API` which gives access to major core events and different modules. The `API` for the front-end is named `chipmunk.client.toollkit`.

### Example

In this example a plugin with a button will be created. When the button is pressed, a popup with a message (provided by the plugin) will be shown along with a button to close the popup window.

**Popup component**
`/popup/template.html - HTML`
```HTML
<p>{{msg}}</p>  <!-- Show message from component -->
```

`/popup/styles.less - LESS`
```CSS
p {
    color: #FFFFFF;
}
```

`/popup/components.ts - Typescript, Angular`
```javascript
import { Component, Input } from '@angular/core';   // Import necessary components for popup

@Component({
    selector: 'example-popup-com',                  // Choose the selector name of the popup
    templateUrl: './template.html',                 // Assign HTML file as template
    styleUrls: ['./styles.less']                    // Assign LESS file as style sheet file})

export class PopupComponent {

    constructor() { }

    @Input() public msg: string;                    // Expect input from host component
}
```

**Plugin component**
`template.html - HTML`
```HTML
<p>Example</p>
<button click="_ng_popup()"></button>               <!-- Button to open popup -->
```

`styles.less - LESS`
```CSS
p {
    color: #FFFFFF;
}
```

`components.ts - Typescript, Angular`
```javascript
import { Component, Input } from '@angular/core';       // Import necessary components for plugin
import { PopupComponent } from './popup/components';    // Import the popup module

@Component({
    selector: 'example',                                // Choose the selector name of the popup
    templateUrl: './template.html',                     // Assign HTML file as template
    styleUrls: ['./styles.less']                        // Assign LESS file as style sheet file})

export class ExampleComponent {

    @Input() public api: Toolkit.IAPI;                  // API assignment
    @Input() public msg: string;                        // Expect input from host component

    constructor() { }

    public _ng_popup() {
        this.api.addPopup({
            caption: 'Example',
            component: {
                factory: PopupComponent,                // Assign the popup module to factory
                inputs: {
                    msg: 'Hello World!',                // Provide the popup with a message as input
                }
            },
            buttons: [                                  // Create a button on the popup to close it
                {
                    caption: 'Cancel',
                    handler: () => {
                        this.api.removePopup();         // Close popup
                    }
                }
            ]
        });
    }
}
```

> NOTE: For more information how the `API` works check out `Chapter 5 - API`

## Notifications

To create notifications, the `API` is required. **Chipmunk** provides an `API` which gives access to major core events and different modules. The `API` for the front-end is named `chipmunk.client.toollkit`.

### Example

The following example shows an example plugin with a line of text and a button which creates a notification.

`template.html - HTML`
``` HTML
<p>Example</p>                                                  <!-- Create a line of text -->
<button (click)="_ng_notify"></button>                          <!-- Create a button with a method to be called from the components.ts file -->
```

`styles.less - LESS`
``` CSS
p {
    color: #FFFFFF;
}

button {
    height: 20px;
    width: 50px;
}
```

`component.ts - Typescript, Angular`
```javascript
import { Component } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
import { ENotificationType } from 'chipmunk.client.toolkit';    // Import notification type

@Component({
    selector: 'example',                                        // Choose the selector name of the plugin
    templateUrl: './template.html',                             // Assign HTML file as template
    styleUrls: ['./styles.less']                                // Assign LESS file as style sheet file
})

export class ExampleComponent {

    @Input() public api: Toolkit.IAPI;                          // API assignment

    public _ng_notify() {
        this.api.addNotification({
            caption: 'Info',                                    // Caption of the notification
            message: 'You just got notified!',                  // Message of the notification
            options: {
                type: ENotificationType.info                    // Notification type
            }
        });
    }
}
```

> NOTE: For more information how the `API` works check out `Chapter 5 - API`

## Logger

To use the logger, the `API` is required. **Chipmunk** provides an `API` which gives access to major core events and different modules. The `API` for the front-end is named `chipmunk.client.toollkit`.

### Example

In the example below a plugin is created which logs a message as soon as the plugin is created.

`template.html - HTML`
```HTML
<p>Example</p>                                                                  <!-- Create a line of text -->
```

`styles.less - LESS`
```CSS
p {
    color: #FFFFFF;
}
```

`component.ts - Typescript, Angular`
```javascript
import { Component } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';

@Component({
    selector: 'example',                                                        // Choose the selector name of the plugin
    templateUrl: './template.html',                                             // Assign HTML file as template
    styleUrls: ['./styles.less']                                                // Assign LESS file as style sheet file})

export class ExampleComponent {

    private _logger: Toolkit.Logger = new Toolkit.Logger('Plugin: example: ');  // Instantiate logger with signature
    
    constructor() {
        this._logger.debug('Plugin started!');                                  // Create debug message
    }
}
```

> NOTE: For more information how the `API` works check out `Chapter 5 - API`

# Front-end - Non-Angular Plugin

**Non-Angular Plugins** are also known as **Standalone Plugins**, which are plugins that are implemented in the **front-end**, but neither do they have Angular in it nor do they have an UI.
**Non-Angular Plugins** are used to parse the output stream that is being shown in the main window of **Chipmunk**.

## Example

This example shows how to create a simple **Non-Angular** plugin which prints `-->` in front of each line.
To create this example the abstract class `ARowCommonParser` from the `API` is required to extend from. **Chipmunk** provides an `API` which gives access to major core events and different modules. The `API` for the front-end is named `chipmunk.client.toollkit`.

`index.ts` - Typescript
```javascript
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class

class ParseMe extends Toolkit.ARowCommonParser {                                                    // Extend parser class with Abstract parser class 
    public parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo): string {    // Create parser which modifies and returns parsed string
        return `--> ${str}`;                                                                        // Return string with --> in front
    }
} 

const gate: Toolkit.APluginServiceGate | undefined = (window as any).logviewer;                     // Necessary to bind namespace
if (gate === undefined) {                                                                           // If binding didn't work print out error message
    console.error(`Fail to find logviewer gate.`);
} else {
    gate.setPluginExports({                                                                         // Set parser(s) to export here (Setting Multiple parsers possible)
        parser: new ParseMe()                                                                       // Create parser instance (Free to choose parser name)
    });
}
```

> NOTE: For more information how the `API` works check out `Chapter 5 - API`

# Developer mode and Breakpoints

The developer mode can be very helpful at developing (espescially for the development in the front-end). To enable the developing mode, type the following command in the command line, in which the application is started:

`CHIPMUNK_DEVELOPING_MODE=ON`

The developer mode will create a debugger console with which console outputs made in the front-end can be seen.

Another feature which the debugger provides is creating breakpoints as well as the ability to select HTML elements which then will be highlighted in the code along with its attributes. 

To create **breakpoints**, type the keyword `debugger` in the line the breakpoint should activate.

### Example

In the example below a plugin is created which has a breakpoint in the constructor, so the application stops as soon as the application is created.

`template.html - HTML`
```HTML
<p>Example</p>
```

`styles.less - LESS`
```CSS
p {
    color: #FFFFFF;
}
```

`component.ts - Typescript, Angular`
```Typescript
import { Component } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';

@Component({
    selector: 'example',                            // Choose the selector name of the plugin
    templateUrl: './template.html',                 // Assign HTML file as template
    styleUrls: ['./styles.less']                    // Assign LESS file as style sheet file})

export class ExampleComponent {

    constructor() {
        console.log('Stop after!');                 // Console output to see where the breakpoint will appear
        debugger;                                   // Creating a breakpoint in the constructor
    }
}
```

In the following chapter the **back-end** of plugins as well as the communication between the front-end and the back-end will be covered.