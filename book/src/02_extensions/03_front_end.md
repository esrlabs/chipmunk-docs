<link rel="stylesheet" type="text/css" href="../styles/styles.tab.css">

<script src="../scripts/script.tab.js">
</script>

# Front-end - Angular Plugin

**Angular** plugins are located in the **front-end** of the application in the folder `client.plugins`.
The main characteristic of an implementation in the **front-end** is the ability to modify the visual part of the plugin. **front-end** plugins mainly consist of HTML, CSS and Typescript files, whereas the Typescript files include, inter alia, Angular.

## Example

This section explains how to create a simple plugin with a line of text and a button that prints `'Hello World!'` in the console:

**Visual**
Since the **front-end** is being created with Angular, the plugin is treated like a component. To shape the visual part of the plugin, configure the `template.html` file (holds the HTML components) and `styles.less` file (holds the style settings).

**Functionality**
The HTML elements can be attached with any kind of functions, which need to be configured in the `components.ts` file.

**External libraries**
To expand the range of classes and methods the `example` plugin can make use of, modify the `module.ts` file.

The library management of the plugin is defined in `public_api.ts` which manages and exports the public definitions of the plugin. In this example only the `module.ts` and `component.ts` files are being exported.

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'public_api.ts')">public_api.ts</button>
</div>

<div id="template.html" class="tabcontent">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_click()&quot;&gt;&lt;/button&gt;   &lt;!-- Create a button with a method to be called from the components.ts file --&gt;
</code></pre>
</div>

<div id="styles.less" class="tabcontent">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
button {
    height: 20px;
    width: 50px;
}
</code></pre>
</div>

<div id="component.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
</code></pre>
</div>

<div id="module.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
</code></pre>
</div>

<div id="public_api.ts" class="tabcontent">
<pre><code class="language-Javascript">
export * from './lib/component';    // Export the main component of the plugin
export * from './lib/module';       // Export the module file of the plugin
</code></pre>
</div>

> **IMPORTANT**: Make sure the `PluginModule` class inherits from `Toolkit.PluginNgModule` or else the modules won't be part of the plugin!

> **IMPORTANT**: Exporting the component and module is required by Angular and necessary for the plugin to work!

## Popup

To create and remove popups, the <a href="05_api.html#api">`API`</a> is required. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the front-end is named `chipmunk.client.toollkit`.

### Example

In this example a plugin with a button will be created. When the button is pressed, a popup with a message (provided by the plugin) will be shown along with a button to close the popup window.

**Popup component**

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'popup_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'popup_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'popup_component.ts')">component.ts</button>
</div>

<div id="popup_template.html" class="tabcontent">
<pre><code class="language-HTML">
&lt;p&gt;{{msg}}&lt;/p&gt;  &lt;!-- Show message from component --&gt;
</code></pre>
</div>

<div id="popup_styles.less" class="tabcontent">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="popup_component.ts" class="tabcontent">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';   // Import necessary components for popup
@Component({
    selector: 'example-popup-com',                  // Choose the selector name of the popup
    templateUrl: './template.html',                 // Assign HTML file as template
    styleUrls: ['./styles.less']                    // Assign LESS file as style sheet file})
export class PopupComponent {
    @Input() public msg: string;                    // Expect input from host component
    constructor() { }
}
</code></pre>
</div>

**Plugin component**

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'popup_plugin_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'popup_plugin_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'popup_plugin_component.ts')">component.ts</button>
</div>

<div id="popup_plugin_template.html" class="tabcontent">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_popup()&quot;&gt;&lt;/button&gt;   &lt;!-- Button to open popup --&gt;
</code></pre>
</div>

<div id="popup_plugin_styles.less" class="tabcontent">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="popup_plugin_component.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
</code></pre>
</div>

> NOTE: For more information how the `API` works check out <a href="05_api.html#api">`Chapter 5 - API`</a>

## Notifications

To create notifications, the <a href="05_api.html#api">`API`</a> is required. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the front-end is named `chipmunk.client.toollkit`.

### Example

The following example shows an example plugin with a line of text and a button which creates a notification.

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'notification_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'notification_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'notification_component.ts')">component.ts</button>
</div>

<div id="notification_template.html" class="tabcontent">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_notify()&quot;&gt;&lt;/button&gt;   &lt;!-- Create a button with a method to be called from the components.ts file --&gt;
</code></pre>
</div>

<div id="notification_styles.less" class="tabcontent">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
button {
    height: 20px;
    width: 50px;
}
</code></pre>
</div>

<div id="notification_component.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
    constructor() { }
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
</code></pre>
</div>

> NOTE: For more information how the `API` works check out <a href="05_api.html#api">`Chapter 5 - API`</a>

# Front-end - Non-Angular Plugin

**Non-Angular Plugins** are also known as **Standalone Plugins**, which are plugins that are implemented in the **front-end**, but neither do they have Angular in it nor do they have an UI.
**Non-Angular Plugins** are used to parse the output stream that is being shown in the main window of **Chipmunk**.

## Example

This example shows how to create a simple **Non-Angular** plugin which prints `-->` in front of each line.
To create this example the abstract class `ARowCommonParser` from the `API` is required to extend from. **Chipmunk** provides an `API` which gives access to major core events and different modules. The `API` for the front-end is named `chipmunk.client.toollkit`.

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'index.ts')">index.ts</button>
</div>

<div id="index.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
</code></pre>
</div>

## Example

This example shows how to create a simple **Non-Angular** plugin which prints `-->` in front of each line.
To create this example the abstract class <a href="05_api.html#rcp">`RowCommonParser`</a> from the <a href="05_api.html#api">`API`</a> is required to extend from. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the front-end is named `chipmunk.client.toollkit`.

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'index.ts')">index.ts</button>
</div>

<div id="index.ts" class="tabcontent">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class
class ParseMe extends Toolkit.RowCommonParser {                                                    // Extend parser class with Abstract parser class 
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
</code></pre>
</div>

> NOTE: For more information how the `API` works check out <a href="05_api.html#api">`Chapter 5 - API`</a>

## Logger

To use the logger, the <a href="05_api.html#api">`API`</a> is required. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the front-end is named `chipmunk.client.toollkit`.

### Example

In the example below a plugin is created which logs a message as soon as the plugin is created.

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'logger_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'logger_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'logger_component.ts')">component.ts</button>
</div>

<div id="logger_template.html" class="tabcontent">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;     &lt;!-- Create a line of text --&gt;
</code></pre>
</div>

<div id="logger_styles.less" class="tabcontent">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="logger_component.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
</code></pre>
</div>

> NOTE: For more information how the `API` works check out <a href="05_api.html#api">`Chapter 5 - API`</a>

# Developer mode and Breakpoints

The developer mode can be very helpful at developing (espescially for the development in the front-end). To enable the developing mode, type the following command in the command line, in which the application is started:

`CHIPMUNK_DEVELOPING_MODE=ON`

The developer mode will create a debugger console with which console outputs made in the front-end can be seen.

Another feature which the debugger provides is creating breakpoints as well as the ability to select HTML elements which then will be highlighted in the code along with its attributes. 

To create **breakpoints**, type the keyword `debugger` in the line the breakpoint should activate.

### Example

In the example below a plugin is created which has a breakpoint in the constructor, so the application stops as soon as the application is created.

<div class="tab">
  <button class="tablinks" onclick="openCode(event, 'dev_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'dev_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'dev_component.ts')">component.ts</button>
</div>

<div id="dev_template.html" class="tabcontent">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="dev_styles.less" class="tabcontent">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="dev_component.ts" class="tabcontent">
<pre><code class="language-Javascript">
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
</code></pre>
</div>

The following chapter covers some general information about the **back-end** of complex plugins as well as an example.