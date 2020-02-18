<link rel="stylesheet" type="text/css" href="../styles/styles.tab.css">

<script src="../scripts/script.tab.js">
</script>

<h1 id="api">API</h1>

Chipmunk provides an `API` for the front-end, which gives access to major core events, UI of the core and plugin IPC (required for communication beteween the host and render of plugin). The `API` for the front-end is named `chipmunk.client.toollkit` and holds different modules.

<h2> Table of content </h2>
<ol class="toc">
    <li><a href="#howAPI">How to use the API</a></li>
    <li><a href="#iapi">IAPI interface</a></li>
    <li><a href="#abstract">Abstract classes</a>
        <ol>
            <li><a href="#parsers">Parsers</a></li>
            <li><a href="#ipc">IPC</a></li>
        </ol>
    </li>
    <li><a href="#api_class">Classes</a>
        <ol>
            <li><a href="#cse">ControllerSessionEvents</a></li>
            <li><a href="#ipc_service">PluginIPCService</a></li>
            <li><a href="#service_conf">ServiceConfig</a></li>
            <li><a href="#logger">Logger</a></li>
        </ol>
    </li>
</ol>

<h2 id="howAPI"> How to use the API</h2>

<h3 id="api1"> Method 1: Bind the api to the component </h3>
One way to use the API is by binding it to the main component of the plugin (`component.ts`).

> **IMPORTANT**: When the `API` is bound to component directly, the `API` is bound to the life cycle of the component and gets destroyed together with the component. It is advised to bind the `API` to the component if it is going to be used locally only by the component itself and nothing else. If the `API` should be used globally (in scope of the plugin), the second method is more suited.

The example code below shows an example plugin with the API bound to it. The example also includes three methods that are being called upon specific events from the sessions/tabs. To demonstrate how to use the `API`, each time the session changes the session ID will be printed out in the console.

<div class="tab api">
  <button class="tablinks active" onclick="openCode(event, 'api_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'api_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'api_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'api_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'api_public_api.ts')">public_api.ts</button>
</div>

<div id="api_template.html" class="tabcontent api active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="api_styles.less" class="tabcontent api">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="api_component.ts" class="tabcontent api">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                                                                                // Choose the selector name of the plugin
    templateUrl: './template.html',                                                                                     // Assign HTML file as template
    styleUrls: ['./styles.less']                                                                                        // Assign LESS file as style sheet file})
})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                                                                                  // API assignment
    @Input() public session: string;                                                                                    // [optional] Session ID assignment
    @Input() public sessions: Toolkit.ControllerSessionsEvents;                                                         // [optional] Session event listener assignment
    private _subs: { [key: string]: Toolkit.Subscription } = {};                                                        // [optional] Hashlist for session events
    constructor() {
        this._subs.onSessionChange = this.sessions.subscribe().onSessionChange(this._onSessionChange.bind(this));       // [optional] Subscribe to session change event
        this._subs.onSessionOpen = this.sessions.subscribe().onSessionOpen(this._onSessionOpen.bind(this));             // [optional] Subscribe to new session open event
        this._subs.onSessionClose = this.sessions.subscribe().onSessionClose(this._onSessionClose.bind(this));          // [optional] Subscribe to session close event
    }
    private _onSessionChange(session: string) {                                                                         // [optional] Method when session changes
        this.session = session;                                                                                         // Reassign the session to the session, to which has been changed to
        console.log(`Session id: ${this.api.getActiveSessionId()}`);                                                    // Print session ID in the console when the session changes
    }
    private _onSessionOpen(session: string) { }                                                                         // [optional] Method when new session opens
    private _onSessionClose(session: string) { }                                                                        // [optional] Method when session closes
}
</code></pre>
</div>

<div id="api_module.ts" class="tabcontent api">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="api_public_api.ts" class="tabcontent api">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

> **NOTE**: The lines commented with *[optional]* will be covered in <a href="#cse">ControllerSessionsEvents</a> and serves in this example just for demonstration

<h3 id="api2"> Method 2: Create a service for the api</h3>
Another way to make use of the `API` is by creating a service, which can be accessed from any part of the plugin. To make it work, it is important to export the service file in `public_api.ts`, the library management file of the plugin (generated by Angular automatically).
To demonstrate how to use the `API`, each time the session changes the session ID will be printed out in the console.

> **IMPORTANT**: Compared to the first method, when the `API` is created in a service file, the `API` will be accessable globally (in scope of the plugin) and will only get destroyed when the application is closed.

<div class="tab api2">
  <button class="tablinks active" onclick="openCode(event, 'api2_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'api2_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'api2_service.ts')">service.ts</button>
  <button class="tablinks" onclick="openCode(event, 'api2_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'api2_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'api2_public_api.ts')">public_api.ts</button>
</div>

<div id="api2_template.html" class="tabcontent api2 active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="api2_styles.less" class="tabcontent api2">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="api2_service.ts" class="tabcontent api2">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
export class Service extends Toolkit.PluginService {                                                                                // The service class has to inherit the PluginService from chipmunk.client.toolkit to get access the the API methods
    private api: Toolkit.IAPI | undefined;                                                                                          // Instance variable to assign API
    private session: string;                                                                                                        // [optional] 
    private _subs: { [key: string]: Toolkit.Subscription } = {};                                                                    // [optional] Hashlist of subscriptions for API
    constructor() {
        super();                                                                                                                    // Call parent constructor
        this._subs.onReady = this.onAPIReady.subscribe(this._onReady.bind(this));                                                   // Subscribe to the onAPIReady method from the API to see when the API is ready
    }
    private _onReady() {                                                                                                            // Method to be called when the API is ready
        this.api = this.getAPI();                                                                                                   // Assign the API to instance variable
        if (this.api === undefined) {                                                                                               // Check if the API is defined to prevent errors
            console.log('API not defined!');
            return;
        }
        this._subs.onSessionOpen = this.api.getSessionsEventsHub().subscribe().onSessionOpen(this._onSessionOpen.bind(this));       // [optional] Subscribe to session change event
        this._subs.onSessionClose = this.api.getSessionsEventsHub().subscribe().onSessionClose(this._onSessionClose.bind(this));    // [optional] Subscribe to new session open event
        this._subs.onSessionChange = this.api.getSessionsEventsHub().subscribe().onSessionChange(this._onSessionChange.bind(this)); // [optional] Subscribe to session close event
    }
    private _onSessionChange(session: string) {                                                                                     // [optional] Method when session changes
        this.session = session;                                                                                                     // Reassign the session to the session, to which has been changed to
        console.log(`Session id: ${this.api.getActiveSessionId()}`);                                                                // Print session ID in the console when the session changes
    }
    private _onSessionOpen(session: string) { }                                                                                     // [optional] Method when new session opens
    private _onSessionClose(session: string) { }                                                                                    // [optional] Method when session closes
}
export default (new Service());                                                                                                     // Export the instantiated service class
</code></pre>
</div>

<div id="api2_component.ts" class="tabcontent api2">
<p><strong>NOTE:</strong>The lines commented with <strong>[optional]</strong> will be covered in <a href="#cse">ControllerSessionsEvents</a> and serves in this example just for demonstration</p>
<pre><code class="language-Javascript">
import { Component } from '@angular/core';
@Component({
    selector: 'example',                // Choose the selector name of the plugin
    templateUrl: './template.html',     // Assign HTML file as template
    styleUrls: ['./styles.less']        // Assign LESS file as style sheet file})
export class ExampleComponent {
    constructor() { }                   // Constructor not necessary for API assignment
}
</code></pre>
</div>

<div id="api2_module.ts" class="tabcontent api2">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="api2_public_api.ts" class="tabcontent api2">
<pre><code class="language-Javascript">
import Service from './service';
export * from './component';
export * from './module';
export { Service };
</code></pre>
</div>

> **IMPORTANT**: It's important to note, that the `Service` HAS to be exported to be used globally (in scope of the plugin)

<h1 id="api_inter"> API - Interfaces</h1>

<h2 id="iapi">IAPI</h2>

```Javascript
// Typescript

export interface IAPI {
    /**
     * @returns {PluginIPC} Returns PluginAPI object for host and render plugin communication
     */
    getIPC: () => PluginIPC | undefined;
    /**
     * @returns {string} ID of active stream (active tab)
     */
    getActiveSessionId: () => string;
    /**
     * Returns hub of viewport events (resize, update and so on)
     * Should be used to track state of viewport
     * @returns {ControllerViewportEvents} viewport events hub
     */
    getViewportEventsHub: () => ControllerViewportEvents;
    /**
     * Returns hub of sessions events (open, close, changed and so on)
     * Should be used to track active sessions
     * @returns {ControllerSessionsEvents} sessions events hub
     */
    getSessionsEventsHub: () => ControllerSessionsEvents;
    /**
     * Open popup
     * @param {IPopup} popup - description of popup
     */
    addPopup: (popup: IPopup) => string;
    /**
     * Closes popup
     * @param {string} guid - id of existing popup
     */
    removePopup: (guid: string) => void;
    /**
     * Adds sidebar title injection.
     * This method doesn't need "delete" method, because sidebar injection would be
     * removed with a component, which used as sidebar tab render.
     * In any way developer could define an argument as "undefined" to force removing
     * injection from the title of sidebar
     * @param {IComponentDesc} component - description of Angular component
     * @returns {void}
     */
    setSidebarTitleInjection: (component: IComponentDesc | undefined) => void;
    /**
     * Opens sidebar app by ID
     * @param {string} appId - id of app
     * @param {boolean} silence - do not make tab active
     */
    openSidebarApp: (appId: string, silence: boolean) => void;
    /**
     * Opens toolbar app by ID
     * @param {string} appId - id of app
     * @param {boolean} silence - do not make tab active
     */
    openToolbarApp: (appId: string, silence: boolean) => void;
    /**
     * Adds new notification
     * @param {INotification} notification - notification to be added
     */
    addNotification: (notification: INotification) => void;
}
```

<h3 id="iapi_getIPC">getIPC</h3>

```Javascript
    /**
     * @returns {PluginIPC} Returns PluginAPI object for host and render plugin communication
     */
    getIPC: () => PluginIPC | undefined;
```

### Example - getIPC

In this example the `API` will be assigned to the instance variable of the main component of the plugin

<div class="tab getipc">
  <button class="tablinks active" onclick="openCode(event, 'getIPC_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'getIPC_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'getIPC_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'getIPC_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'getIPC_public_api.ts')">public_api.ts</button>
</div>

<div id="getIPC_template.html" class="tabcontent getipc active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;     &lt;!-- Show session ID --&gt;
</code></pre>
</div>

<div id="getIPC_styles.less" class="tabcontent getipc">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="getIPC_component.ts" class="tabcontent getipc">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                    // Choose the selector name of the plugin
    templateUrl: './template.html',                         // Assign HTML file as template
    styleUrls: ['./styles.less']                            // Assign LESS file as style sheet file
})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                      // API assignment
    public api_copy: Toolkit.IAPI;
    constructor() {
        this.api_copy = this.api.getIPC();                  // Assign API to instance variable
    }
}
</code></pre>
</div>

<div id="getIPC_module.ts" class="tabcontent getipc">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="getIPC_public_api.ts" class="tabcontent getipc">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_getActive">getActiveSessionId</h3>

```Javascript
    /**
     * @returns {string} ID of active stream (active tab)
     */
    getActiveSessionId: () => string;
```

### Example - getActiveSessionId

In this example the session id will be shown in the plugin

<div class="tab asid">
  <button class="tablinks active" onclick="openCode(event, 'asid_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'asid_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'asid_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'asid_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'asid_public_api.ts')">public_api.ts</button>
</div>

<div id="asid_template.html" class="tabcontent asid active">
<pre><code class="language-HTML">
&lt;p&gt;{{sessionID}}&lt;/p&gt;   &lt;!-- Show session ID --&gt;
</code></pre>
</div>

<div id="asid_styles.less" class="tabcontent asid">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="asid_component.ts" class="tabcontent asid">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                        // Choose the selector name of the plugin
    templateUrl: './template.html',                             // Assign HTML file as template
    styleUrls: ['./styles.less']                                // Assign LESS file as style sheet file
})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                          // API assignment
    public sessionID: string;
    constructor() {
        this.sessionID = this.api.getActiveSessionId();         // Assign session id to local variable
    }
}
</code></pre>
</div>

<div id="asid_module.ts" class="tabcontent asid">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="asid_public_api.ts" class="tabcontent asid">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_getVPEH">getViewportEventsHub</h3>

```Javascript
    /**
     * Returns hub of viewport events (resize, update and so on)
     * Should be used to track state of viewport
     * @returns {ControllerViewportEvents} viewport events hub
     */
    getViewportEventsHub: () => ControllerViewportEvents;
```

### Example - getViewportEventsHub

<div class="tab vpe">
  <button class="tablinks active" onclick="openCode(event, 'vpe_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'vpe_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'vpe_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'vpe_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'vpe_public_api.ts')">public_api.ts</button>
</div>

<div id="vpe_template.html" class="tabcontent vpe active">
<pre><code class="language-HTML">
&lt;p #element&gt;Example&lt;/p&gt;     &lt;!-- Create a line of text --&gt;
</code></pre>
</div>

<div id="vpe_styles.less" class="tabcontent vpe">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="vpe_component.ts" class="tabcontent vpe">
<pre><code class="language-Javascript">
import { Component, Input, ViewChild } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                                                                                // Choose the selector name of the plugin
    templateUrl: './template.html',                                                                                     // Assign HTML file as template
    styleUrls: ['./styles.less']                                                                                        // Assign LESS file as style sheet file})
})
export class ExampleComponent {
    @ViewChild('element', {static: false}) _element: HTMLParagraphElement;
    @Input() public api: Toolkit.IAPI;                                                                                  // API assignment
    private _subs: { [key: string]: Toolkit.Subscription } = {};                                                        // Hashlist for subscriptions
    constructor() {
        this._subs.onRowSelected() = this.api.getViewportEventsHub().subscribe().onRowSelected(this._onRow.bind(this)); // Subscribe to the row selection event and call _onRow in case a row is selected
    }
    private _onRow() {
        const selected = this.api.getViewportEventsHub().getSelected();
        this._element.innerHTML = `Line: ${selected.row}: ${selected.str}`;                                             // Reassign the text of the plugin paragraph with the selected line and its text
    }
}
</code></pre>
</div>

<div id="vpe_module.ts" class="tabcontent vpe">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="vpe_public_api.ts" class="tabcontent vpe">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="getSEH">getSessionsEventsHub</h3>

```Javascript
    /**
     * Returns hub of sessions events (open, close, changed and so on)
     * Should be used to track active sessions
     * @returns {ControllerSessionsEvents} sessions events hub
     */
    getSessionsEventsHub: () => ControllerSessionsEvents;
```

### Example - getSessionsEventsHub

This example shows the usage of `getSessionsEventsHub` by creating methods to be called when a session _opens/closes/changes_:

<div class="tab seh">
  <button class="tablinks active" onclick="openCode(event, 'seh_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'seh_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'seh_service.ts')">service.ts</button>
  <button class="tablinks" onclick="openCode(event, 'seh_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'seh_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'seh_public_api.ts')">public_api.ts</button>
</div>

<div id="seh_template.html" class="tabcontent seh active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;      &lt;!-- Create a line of text --&gt;
</code></pre>
</div>

<div id="seh_styles.less" class="tabcontent seh">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="seh_service.ts" class="tabcontent seh">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
export class Service extends Toolkit.PluginService {                                                                                // The service class has to inherit the PluginService from chipmunk.client.toolkit to get access the the API methods
    private api: Toolkit.IAPI | undefined;                                                                                          // Instance variable to assign API
    private session: string;                                                                                                        // Instance variable to assign session ID 
    private _subs: { [key: string]: Toolkit.Subscription } = {};                                                                    // Hashlist of subscriptions for API
    constructor() {
        super();                                                                                                                    // Call parent constructor
        this._subs.onReady = this.onAPIReady.subscribe(this._onReady.bind(this));                                                   // Subscribe to the onAPIReady method from the API to see when the API is ready
    }
    private _onReady() {                                                                                                            // Method to be called when the API is ready
        this.api = this.getAPI();                                                                                                   // Assign the API to instance variable
        if (this.api === undefined) {                                                                                               // Check if the API is defined to prevent errors
            console.log('API not defined!');
            return;
        }
        this._subs.onSessionOpen = this.api.getSessionsEventsHub().subscribe().onSessionOpen(this._onSessionOpen.bind(this));       // <-- Subscribe to session change event
        this._subs.onSessionClose = this.api.getSessionsEventsHub().subscribe().onSessionClose(this._onSessionClose.bind(this));    // <-- Subscribe to new session open event
        this._subs.onSessionChange = this.api.getSessionsEventsHub().subscribe().onSessionChange(this._onSessionChange.bind(this)); // <-- Subscribe to session close event
    }
    private _onSessionChange(session: string) {                                                                                     // Method when session changes
        this.session = session;                                                                                                     // Reassign the session to the session, to which has been changed to
        console.log(`Session id: ${this.api.getActiveSessionId()}`);                                                                // Print session ID in the console when the session changes
    }
    private _onSessionOpen(session: string) { }                                                                                     // Method when new session opens
    private _onSessionClose(session: string) { }                                                                                    // Method when session closes
}
export default (new Service());                                                                                                     // Export the instantiated service class
</code></pre>
</div>

<div id="seh_component.ts" class="tabcontent seh">
<pre><code class="language-Javascript">
import { Component } from '@angular/core';
import Service from './service'
@Component({
    selector: 'example',                                                                                                            // Choose the selector name of the plugin
    templateUrl: './template.html',                                                                                                 // Assign HTML file as template
    styleUrls: ['./styles.less']                                                                                                    // Assign LESS file as style sheet file})
export class ExampleComponent {
    constructor() { }
}
</code></pre>
</div>

<div id="seh_module.ts" class="tabcontent seh">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                                                                                           // Import the Angular component that is necessary for the setup below
import { Example } from './component';                                                                                              // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';                                                                                 // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ]                                                                                              // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                                                                                                   // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                                                                                                   // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {                                                                          // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');                                                                               // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="seh_public_api.ts" class="tabcontent seh">
<pre><code class="language-Javascript">
import Service from './service';
export * from './component';
export * from './module';
export { Service };
</code></pre>
</div>

> **IMPORTANT**: It's important to note, that the `Service` **HAS** to be exported to be used globally (in scope of the plugin)

<h3 id="iapi_addPopup">addPopup</h3>

```Javascript
    /**
     * Open popup
     * @param {IPopup} popup - description of popup
     */
    addPopup: (popup: IPopup) => string;
```

### Example - addPopup

To create a popup, a plugin to host the popup and the popup itself have to be defined.

<div class="tab addpop">
  <button class="tablinks active" onclick="openCode(event, 'addPop_pop_template.html')">/popup/template.html</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_pop_styles.less')">/popup/styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_pop_component.ts')">/popup/component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'addPop_public_api.ts')">public_api.ts</button>
</div>

<div id="addPop_pop_template.html" class="tabcontent addpop active">
<pre><code class="language-HTML">
&lt;p&gt;{{msg}}&lt;/p&gt;      &lt;!-- Show message from component --&gt;
</code></pre>
</div>

<div id="addPop_pop_styles.less" class="tabcontent addpop">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="addPop_pop_component.ts" class="tabcontent addpop">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';           // Import necessary components for popup
@Component({
    selector: 'example-popup-com',                          // Choose the selector name of the popup
    templateUrl: './template.html',                         // Assign HTML file as template
    styleUrls: ['./styles.less']                            // Assign LESS file as style sheet file})
export class PopupComponent {
    constructor() { }
    @Input() public msg: string;                            // Expect input from host component
}
</code></pre>
</div>

<div id="addPop_template.html" class="tabcontent addpop">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_popup()&quot;&gt;&lt;/button&gt;       &lt;!-- Button to open popup --&gt;
</code></pre>
</div>

<div id="addPop_styles.less" class="tabcontent addpop">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="addPop_component.ts" class="tabcontent addpop">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';           // Import necessary components for plugin
import { PopupComponent } from './popup/components';        // Import the popup module
@Component({
    selector: 'example',                                    // Choose the selector name of the popup
    templateUrl: './template.html',                         // Assign HTML file as template
    styleUrls: ['./styles.less']                            // Assign LESS file as style sheet file})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                      // API assignment
    @Input() public msg: string;                            // Expect input from host component
    constructor() { }
    public _ng_popup() {
        this.api.addPopup({
            caption: 'Example',
            component: {
                factory: PopupComponent,                    // Assign the popup module to factory
                inputs: {
                    msg: 'Hello World!',                    // Provide the popup with a message as input
                }
            },
            buttons: []
        });
    }
}
</code></pre>
</div>

<div id="addPop_module.ts" class="tabcontent addpop">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="addPop_public_api.ts" class="tabcontent addpop">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_rmPop">removePopup</h3>

```Javascript
    /**
     * Closes popup
     * @param {string} guid - id of existing popup
     */
    removePopup: (guid: string) => void;
```

### Example - removePopup

To remove the popup, one way is to create a button on the popup, which calls the method to remove the popup upon clicking.

<div class="tab rempop">
  <button class="tablinks active" onclick="openCode(event, 'remPop_pop_template.html')">/popup/template.html</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_pop_styles.less')">/popup/styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_pop_component.ts')">/popup/component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'remPop_public_api.ts')">public_api.ts</button>
</div>

<div id="remPop_pop_template.html" class="tabcontent rempop active">
<pre><code class="language-HTML">
&lt;p&gt;{{msg}}&lt;/p&gt;      &lt;!-- Show message from component --&gt;
</code></pre>
</div>

<div id="remPop_pop_styles.less" class="tabcontent rempop">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="remPop_pop_component.ts" class="tabcontent rempop">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';           // Import necessary components for popup
@Component({
    selector: 'example-popup-com',                          // Choose the selector name of the popup
    templateUrl: './template.html',                         // Assign HTML file as template
    styleUrls: ['./styles.less']                            // Assign LESS file as style sheet file})
export class PopupComponent {
    constructor() { }
    @Input() public msg: string;                            // Expect input from host component
}
</code></pre>
</div>

<div id="remPop_template.html" class="tabcontent rempop">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_popup()&quot;&gt;&lt;/button&gt;       &lt;!-- Button to open popup --&gt;
</code></pre>
</div>

<div id="remPop_styles.less" class="tabcontent rempop">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="remPop_component.ts" class="tabcontent rempop">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';           // Import necessary components for plugin
import { PopupComponent } from './popup/components';        // Import the popup module
@Component({
    selector: 'example',                                    // Choose the selector name of the popup
    templateUrl: './template.html',                         // Assign HTML file as template
    styleUrls: ['./styles.less']                            // Assign LESS file as style sheet file})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                      // API assignment
    @Input() public msg: string;                            // Expect input from host component
    constructor() { }
    public _ng_popup() {
        this.api.addPopup({
            caption: 'Example',
            component: {
                factory: PopupComponent,                    // Assign the popup module to factory
                inputs: {
                    msg: 'Hello World!',                    // Provide the popup with a message as input
                }
            },
            buttons: [                                      // Create a button on the popup to close it
                {
                    caption: 'close',
                    handler: () => {
                        this.api.removePopup();             // close and remove popup
                    }
                }
            ]
        });
    }
}
</code></pre>
</div>

<div id="remPop_module.ts" class="tabcontent rempop">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="remPop_public_api.ts" class="tabcontent rempop">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_sti">setSidebarTitleInjection</h3>

```Javascript
    /**
     * Adds sidebar title injection.
     * This method doesn't need "delete" method, because sidebar injection would be
     * removed with a component, which used as sidebar tab render.
     * In any way developer could define an argument as "undefined" to force removing
     * injection from the title of sidebar
     * @param {IComponentDesc} component - description of Angular component
     * @returns {void}
     */
    setSidebarTitleInjection: (component: IComponentDesc | undefined) => void;
```

### Example - setSidebarTitleInjection

In this example a button will be created in the title of the sidebar which will log a message when clicked.

<div class="tab sti">
  <button class="tablinks active" onclick="openCode(event, 'title_template.html')">/title/template.html</button>
  <button class="tablinks" onclick="openCode(event, 'title_styles.less')">/title/styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'title_component.ts')">/title/component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'titleP_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'titleP_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'titleP_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'titleP_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'titleP_public_api.ts')">public_api.ts</button>
</div>

<div id="title_template.html" class="tabcontent sti active">
<pre><code class="language-HTML">
&lt;!-- Create the title component of the button. --&gt;
&lt;span&gt;+&lt;/span&gt;      &lt;!-- Create '+' as button --&gt;
</code></pre>
</div>

<div id="title_styles.less" class="tabcontent sti">
<pre><code class="language-CSS">
span {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="title_component.ts" class="tabcontent sti">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'lib-add',
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class ExampleTitleComponent {
    @Input() public _ng_click: () => void;      // Take method from host component and execute when clicked
}
</code></pre>
</div>

<div id="titleP_template.html" class="tabcontent sti">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;      &lt;!-- Show example string --&gt;
</code></pre>
</div>

<div id="titleP_styles.less" class="tabcontent sti">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="titleP_component.ts" class="tabcontent sti">
<pre><code class="language-Javascript">
import { Component, AfterViewInit } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                        // Choose the selector name of the plugin
    templateUrl: './template.html',                             // Assign HTML file as template
    styleUrls: ['./styles.less']                                // Assign LESS file as style sheet file
})
export class ExampleComponent implements AfterViewInit {
    @Input() public api: Toolkit.IAPI;                          // API assignment
    ngAfterViewInit() {
        this.api.setSidebarTitleInjection({                     // Create button in title
            factory: ExampleTitleComponent,                     // Assign component for button
            inputs: {
                _ng_click: () => { console.log('Clicked!') },   // Provide function, which logs a string in console, as input
            }
        });
    }
}
</code></pre>
</div>

<div id="titleP_module.ts" class="tabcontent sti">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="titleP_public_api.ts" class="tabcontent sti">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_osa">openSidebarApp</h3>

```Javascript
    /**
     * Opens sidebar app by ID
     * @param {string} appId - id of app
     * @param {boolean} silence - do not make tab active
     */
    openSidebarApp: (appId: string, silence: boolean) => void;
```

### Example - openSidebarApp

In this example the plugin `serial` will be opened and set as the active plugin 2 seconds after the `example` plugin is opened.

<div class="tab osa">
  <button class="tablinks active" onclick="openCode(event, 'sb_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'sb_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'sb_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'sb_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'sb_public_api.ts')">public_api.ts</button>
</div>

<div id="sb_template.html" class="tabcontent osa active">
<pre><code class="language-HTML">
&lt;p&gt;Wait for it...&lt;/p&gt;       &lt;!-- Show example string --&gt;
</code></pre>
</div>

<div id="sb_styles.less" class="tabcontent osa">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="sb_component.ts" class="tabcontent osa">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                        // Choose the selector name of the plugin
    templateUrl: './template.html',                             // Assign HTML file as template
    styleUrls: ['./styles.less']                                // Assign LESS file as style sheet file
})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                          // API assignment
    constructor() {
        setTimeout(() => {                                      // Set a timeout of 2000 ms before opening the plugin
            this.api.openSidebarApp('serial', false);           // Open the serial plugin and set it as the active plugin 
        }, 2000);
    }
}
</code></pre>
</div>

<div id="sb_module.ts" class="tabcontent osa">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="sb_public_api.ts" class="tabcontent osa">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_ota">openToolbarApp</h3>

```Javascript
    /**
     * Opens toolbar app by ID
     * @param {string} appId - id of app
     * @param {boolean} silence - do not make tab active
     */
    openToolbarApp: (appId: string, silence: boolean) => void;
```

### Example - openToolbarApp

In this example the `xterminal` app will be opened and set as active 2 seconds after the `example` plugin is opened.

<div class="tab ota">
  <button class="tablinks active" onclick="openCode(event, 'tb_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'tb_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'tb_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'tb_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'tb_public_api.ts')">public_api.ts</button>
</div>

<div id="tb_template.html" class="tabcontent ota active">
<pre><code class="language-HTML">
&lt;p&gt;Wait for it...&lt;/p&gt;       &lt;!-- Show example string --&gt;
</code></pre>
</div>

<div id="tb_styles.less" class="tabcontent ota">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="tb_component.ts" class="tabcontent ota">
<pre><code class="language-Javascript">
import { Component, Input, AfterViewInit } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                        // Choose the selector name of the plugin
    templateUrl: './template.html',                             // Assign HTML file as template
    styleUrls: ['./styles.less']                                // Assign LESS file as style sheet file
})
export class ExampleComponent implements AfterViewInit {
    @Input() public api: Toolkit.IAPI;                          // API assignment
    constructor() {
        setTimeout(() => {                                      // Set a timeout of 2000 ms before opening the app
            this.api.openToolbarApp('xterminal', false);        // Open the xterminal app and set it as active
        }, 2000);
    }
}
</code></pre>
</div>

<div id="tb_module.ts" class="tabcontent ota">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="tb_public_api.ts" class="tabcontent ota">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h3 id="iapi_addNot">addNotification</h3>

```Javascript
    /**
     * Adds new notification
     * @param {INotification} notification - notification to be added
     */
    addNotification: (notification: INotification) => void;
```

### Example - addNotification

In this example the `xterminal` app will be opened and set as active 2 seconds after the `example` plugin is opened.

The following example shows an example plugin with a line of text and a button which creates a notification.

<div class="tab not">
  <button class="tablinks active" onclick="openCode(event, 'not_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'not_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'not_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'not_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'not_public_api.ts')">public_api.ts</button>
</div>

<div id="not_template.html" class="tabcontent not active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;                                                  &lt;!-- Create a line of text --&gt;
&lt;button (click)=&quot;_ng_notify()&quot;&gt;&lt;/button&gt;              &lt;!-- Create a button with a method to be called from the components.ts file --&gt;
</code></pre>
</div>

<div id="not_styles.less" class="tabcontent not">
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

<div id="not_component.ts" class="tabcontent not">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
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
</code></pre>
</div>

<div id="not_module.ts" class="tabcontent not">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="not_public_api.ts" class="tabcontent not">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h2 id="cse"> ControllerSessionsEvents </h2>

```Javascript
// Typescript

/**
 * This class provides access to sessions events (like close, open, change of session).
 *
 * @usecases to track sessions state
 * @class ControllerSessionsEvents
 */
export class ControllerSessionsEvents {

    public static Events = {
        /**
         * Fired on user switch a tab (session)
         * @name onSessionChange
         * @event {string} sessionId - active session ID
         */
        onSessionChange: 'onSessionChange',
        /**
         * Fired on user open a new tab (session)
         * @name onSessionOpen
         * @event {string} sessionId - a new session ID
         */
        onSessionOpen: 'onSessionOpen',
        /**
         * Fired on user close a new tab (session)
         * @name onSessionClose
         * @event {string} sessionId - ID of closed session
         */
        onSessionClose: 'onSessionClose',
        /**
         * Fired on stream has been changed
         * @name onStreamUpdated
         * @event {IEventStreamUpdate} event - current state of stream
         */
        onStreamUpdated: 'onStreamUpdated',
        /**
         * Fired on search results has been changed
         * @name onSearchUpdated
         * @event {IEventSearchUpdate} event - current state of stream
         */
        onSearchUpdated: 'onSearchUpdated',
    };

    private _emitter: Emitter = new Emitter();

    public destroy() {
        this._emitter.unsubscribeAll();
    }

    public unsubscribe(event: any) {
        this._emitter.unsubscribeAll(event);
    }

    /**
     * Emits event
     * @returns {Event Emitter} - function event emitter
     */
    public emit(): {
        onSessionChange: (sessionId: string) => void,
        onSessionOpen: (sessionId: string) => void,
        onSessionClose: (sessionId: string) => void,
        onStreamUpdated: (event: IEventStreamUpdate) => void,
        onSearchUpdated: (event: IEventSearchUpdate) => void,
    } {
        return {
            onSessionChange: this._getEmit.bind(this, ControllerSessionsEvents.Events.onSessionChange),
            onSessionOpen: this._getEmit.bind(this, ControllerSessionsEvents.Events.onSessionOpen),
            onSessionClose: this._getEmit.bind(this, ControllerSessionsEvents.Events.onSessionClose),
            onStreamUpdated: this._getEmit.bind(this, ControllerSessionsEvents.Events.onStreamUpdated),
            onSearchUpdated: this._getEmit.bind(this, ControllerSessionsEvents.Events.onSearchUpdated),
        };
    }

    /**
     * Subscribes to event
     * @returns {Event Subscriber} - function-subscriber for each available event
     */
    public subscribe(): {
        onSessionChange: (handler: TSubscriptionHandler<string>) => Subscription,
        onSessionOpen: (handler: TSubscriptionHandler<string>) => Subscription,
        onSessionClose: (handler: TSubscriptionHandler<string>) => Subscription,
        onStreamUpdated: (handler: TSubscriptionHandler<IEventStreamUpdate>) => Subscription,
        onSearchUpdated: (handler: TSubscriptionHandler<IEventSearchUpdate>) => Subscription,
    } {
        return {
            onSessionChange: (handler: TSubscriptionHandler<string>) => {
                return this._getSubscription<string>(ControllerSessionsEvents.Events.onSessionChange, handler);
            },
            onSessionOpen: (handler: TSubscriptionHandler<string>) => {
                return this._getSubscription<string>(ControllerSessionsEvents.Events.onSessionOpen, handler);
            },
            onSessionClose: (handler: TSubscriptionHandler<string>) => {
                return this._getSubscription<string>(ControllerSessionsEvents.Events.onSessionClose, handler);
            },
            onStreamUpdated: (handler: TSubscriptionHandler<IEventStreamUpdate>) => {
                return this._getSubscription<IEventStreamUpdate>(ControllerSessionsEvents.Events.onStreamUpdated, handler);
            },
            onSearchUpdated: (handler: TSubscriptionHandler<IEventSearchUpdate>) => {
                return this._getSubscription<IEventSearchUpdate>(ControllerSessionsEvents.Events.onSearchUpdated, handler);
            },
        };
    }
```

### Example - ControllerSessionEvents

This example shows how to call specific methods when a session is created/closed/changed: 

<div class="tab cse">
  <button class="tablinks active" onclick="openCode(event, 'cse_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'cse_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'cse_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'cse_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'cse_public_api.ts')">public_api.ts</button>
</div>

<div id="cse_template.html" class="tabcontent cse active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;      &lt;!-- Create a line of text --&gt;
</code></pre>
</div>

<div id="cse_styles.less" class="tabcontent cse">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="cse_component.ts" class="tabcontent cse">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                                                                                // Choose the selector name of the plugin
    templateUrl: './template.html',                                                                                     // Assign HTML file as template
    styleUrls: ['./styles.less']                                                                                        // Assign LESS file as style sheet file})
export class ExampleComponent {
    @Input() public api: Toolkit.IAPI;                                                                                  // API assignment
    @Input() public session: string;                                                                                    // Session ID assignment
    @Input() public sessions: Toolkit.ControllerSessionsEvents;                                                         // Session event listener assignment
    private _subs: { [key: string]: Toolkit.Subscription } = {};                                                        // Hashlist for session events
    constructor() {
        this._subs.onSessionChange = this.sessions.subscribe().onSessionChange(this._onSessionSessionChange.bind(this));    // Subscribe to session change event
        this._subs.onSessionOpen = this.sessions.subscribe().onSessionOpen(this._onSessionOpen.bind(this));                 // Subscribe to new session open event
        this._subs.onSessionClose = this.sessions.subscribe().onSessionClose(this._onSessionClose.bind(this));              // Subscribe to session close event
    }
    private _onSessionChange(session: string) {                                                                         // Method when session changes
        this.session = session;                                                                                         // Reassign the session to the session, to which has been changed to
    }
    private _onSessionOpen(session: string) { }                                                                         // Method when new session opens
    private _onSessionClose(session: string) { }                                                                        // Method when session closes
}
</code></pre>
</div>

<div id="cse_module.ts" class="tabcontent cse">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="cse_public_api.ts" class="tabcontent cse">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<h1 id="abstract">API - Abstract classes</h1>

`chipmunk.client.toolkit` provides different kinds of abstract classes from which classes can extend from.

<h2 id="parsers">Parsers</h2>

These abstract classes allow to create **parsers** that can modify the output in the rows (e.g: change text color, convert into different format).

| Parser name                         | Description                                                                                                                     |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| <a href="#rbp">`RowBoundParser`</a> | Parse only data received from the back-end of the plugin                                                                        |
| <a href="#rcp">`RowCommomParser`</a>| Parse data from any kind of source                                                                                              |
| <a href="#rtp">`RowTypedParser`</a> | Parse only specific type of source (e.g. DLT)                                                                                   |
| <a href="#sp">`SelectionParser`</a> | Parse only selected line(s), right-click to see self-chosen name as option to see the parsed result in the tab **Details** below|
| <a href="#trr">`TypedRowRender`</a> | Parser for more complex stream output                                                                                           |
|                                     | <a href="#trrCol">`TypedRowRenderAPIColumns`</a> - show stream line as columns                                                  |
|                                     | <a href="#trrExt">`TypedRowRenderAPIExternal`</a> - use custom Angular component as stream                                      |

<h3 id="rbp">RowBoundParser</h3>

```Javascript
// Typescript

/**
 * Allows creating row parser, which will bound with plugin's host.
 * It means: this row parser will be applied only to data, which was
 * received from plugin's host.
 * It also means: usage of this kind of plugin makes sense only if plugin has
 * host part (backend part), which delivery some data. A good example would be:
 * serial port plugin. Host part extracts data from serial port and sends into
 * stream; render (this kind of plugin) applies only to data, which were gotten
 * from serial port.
 * @usecases decoding stream output content; converting stream output into human-readable format
 * @requirements TypeScript or JavaScript
 * @examples Base64string parser, HEX converting into a string and so on
 * @class RowBoundParser
 */
export declare abstract class RowBoundParser {
    /**
     * This method will be called with each line in stream was gotten from plugin's host
     * @param {string} str - single line from stream (comes only from plugin's host)
     * @param {EThemeType} themeTypeRef - reference to active theme (dark, light and so on)
     * @param {IRowInfo} row - information about current row (see IRowInfo for more details)
     * @returns {string} method should return a string.
     */
    abstract parse(str: string, themeTypeRef: EThemeType, row: IRowInfo): string;
}
```

### Example - RowBoundParser

<div class="tab rbp">
  <button class="tablinks active" onclick="openCode(event, 'rbp_index.ts')">index.ts</button>
</div>

<div id="rbp_index.ts" class="tabcontent rbp active">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class
class ParseMe extends Toolkit.RowBoundParser {                                                      // Extend parser class with Abstract parser class 
    public parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo): string {    // Create parser which modifies and returns parsed string
        return `--> ${str}`;                                                                        // Return string with --> in front
    }
} 
const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;                      // Identification of the plugin
if (gate === undefined) {                                                                           // If binding didn't work print out error message
    console.error(`Fail to find logviewer gate.`);
} else {
    gate.setPluginExports({                                                                         // Set parser(s) to export here (Setting Multiple parsers possible)
        parser: new ParseMe()                                                                       // Create parser instance (Free to choose parser name)
    });
}
</code></pre>
</div>

<h3 id="rcp"> RowCommomParser </h3>

```Javascript
// Typescript

/**
 * Allows creating row parser, which will be applied to each new line in stream.
 * @usecases decoding stream output content; converting stream output into human-readable format
 * @requirements TypeScript or JavaScript
 * @examples Base64string parser, HEX converting into a string and so on
 * @class RowCommonParser
 */
export declare abstract class RowCommonParser {
    /**
     * This method will be called with each line in stream
     * @param {string} str - single line from stream
     * @param {EThemeType} themeTypeRef - reference to active theme (dark, light and so on)
     * @param {IRowInfo} row - information about current row (see IRowInfo for more details)
     * @returns {string} method should return a string.
     */
    abstract parse(str: string, themeTypeRef: EThemeType, row: IRowInfo): string;
}
```

### Example - RowCommonParser

<div class="tab rcp">
  <button class="tablinks active" onclick="openCode(event, 'rcp_index.ts')">index.ts</button>
</div>

<div id="rcp_index.ts" class="tabcontent rcp active">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class
class ParseMe extends Toolkit.RowCommonParser {                                                     // Extend parser class with Abstract parser class 
    public parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo): string {    // Create parser which modifies and returns parsed string
        return `--> ${str}`;                                                                        // Return string with --> in front
    }
} 
const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;                      // Identification of the plugin
if (gate === undefined) {                                                                           // If binding didn't work print out error message
    console.error(`Fail to find logviewer gate.`);
} else {
    gate.setPluginExports({                                                                         // Set parser(s) to export here (Setting Multiple parsers possible)
        parser: new ParseMe()                                                                       // Create parser instance (Free to choose parser name)
    });
}
</code></pre>
</div>

<h3 id="rtp"> RowTypedParser </h3>

```Javascript
// Typescript

/**
 * Allows creating row parser with checking the type of source before.
 * It means this parser could be bound with some specific type of source,
 * for example with some specific file's type (DLT, log and so on)
 * @usecases decoding stream output content; converting stream output into human-readable format
 * @requirements TypeScript or JavaScript
 * @examples Base64string parser, HEX converting into a string and so on
 * @class RowTypedParser
 */
export declare abstract class RowTypedParser {
    /**
     * This method will be called with each line in stream
     * @param {string} str - single line from stream
     * @param {EThemeType} themeTypeRef - reference to active theme (dark, light and so on)
     * @param {IRowInfo} row - information about current row (see IRowInfo for more details)
     * @returns {string} method should return a string.
     */
    abstract parse(str: string, themeTypeRef: EThemeType, row: IRowInfo): string;
    /**
     * This method will be called for each line of stream before method "parse" will be called.
     * @param {string} sourceName - name of source
     * @returns {boolean} - true - method "parse" will be called for this line; false - parser will be ignored
     */
    abstract isTypeMatch(sourceName: string): boolean;
}
```

### Example - RowTypedParser

<div class="tab rtp">
  <button class="tablinks active" onclick="openCode(event, 'rtp_index.ts')">index.ts</button>
</div>

<div id="rtp_index.ts" class="tabcontent rtp active">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class
class ParseMe extends Toolkit.RowTypedParser {                                                      // Extend parser class with Abstract parser class 
    public parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo): string {    // Create parser which modifies and returns parsed string
        return `--> ${str}`;                                                                        // Return string with --> in front
    }
    public isTypeMatch(fileName: string): boolean {                                                 // Typecheck for each line of stream before parsing
        if (typeof fileName === 'string' && fileName.search(/\.txt/) > -1) {                        // Check if source is a .txt file
            return true;                                                                            // Return true in case the it is a .txt file
        }
    }
}
const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;                      // Identification of the plugin
if (gate === undefined) {                                                                           // If binding didn't work print out error message
    console.error(`Fail to find logviewer gate.`);
} else {
    gate.setPluginExports({                                                                         // Set parser(s) to export here (Setting Multiple parsers possible)
        parser: new ParseMe()                                                                       // Create parser instance (Free to choose parser name)
    });
}
</code></pre>
</div>

<h3 id="sp"> SelectionParser</h3>

```Javascript
// Typescript

/**
 * Allows creating parser of selection.
 * Name of the parser will be shown in the context menu of selection. If a user selects parser,
 * parser will be applied to selection and result will be shown on tab "Details"
 * @usecases decoding selected content; converting selected content into human-readable format
 * @requirements TypeScript or JavaScript
 * @examples encrypting of data, Base64string parser, HEX converting into a string and so on
 * @class SelectionParser
 */
export declare abstract class SelectionParser {
    /**
     * This method will be called on user selection
     * @param {string} str - selection in main view or search results view
     * @param {EThemeType} themeTypeRef - reference to active theme (dark, light and so on)
     * @returns {string} method should return a string or HTML string
     */
    abstract parse(str: string, themeTypeRef: EThemeType): string | THTMLString;
    /**
     * Should return name of parser to be shown in context menu of selection
     * @param {string} str - selection in main view or search results view
     * @returns {string} name of parser
     */
    abstract getParserName(str: string): string | undefined;
}
```

### Example - SelectionParser

<div class="tab sp">
  <button class="tablinks active" onclick="openCode(event, 'sp_index.ts')">index.ts</button>
</div>

<div id="sp_index.ts" class="tabcontent sp active">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class
class ParseMe extends Toolkit.SelectionParser {                                                     // Extend parser class with Abstract parser class 
    public parse(str: string, themeTypeRef: Toolkit.EThemeType): string {                           // Create parser which modifies and returns parsed string
        return `--> ${str}`;                                                                        // Return string with --> in front
    }
    public getParserName(str: string) {                                                             // Create a parser that checks if the string only consists of digits
        if ( str.search(/^\d+$/) {                                                                  // If the string only consists of numbers
            return 'Hightlight number';                                                             // return the name of the parser and create an option upon right-clicking
        }
        return undefined;                                                                           // if it's not the case, return 'undefined' to not create an option upon right-clicking
    }
} 
const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;                      // Identification of the plugin
if (gate === undefined) {                                                                           // If binding didn't work print out error message
    console.error(`Fail to find logviewer gate.`);
} else {
    gate.setPluginExports({                                                                         // Set parser(s) to export here (Setting Multiple parsers possible)
        parser: new ParseMe()                                                                       // Create parser instance (Free to choose parser name)
    });
}
</code></pre>
</div>

<h3 id="trr"> TypedRowRender </h3>

```Javascript
// Typescript

/**
 * This class is used for more complex renders of stream output. Like:
 * - TypedRowRenderAPIColumns - to show stream line as columns
 * - TypedRowRenderAPIExternal - to use custom Angular component as stream
 * line render
 *
 * @usecases to show content in columns; to have full HTML/LESS features for rendering
 * @class TypedRowRender
 */
export declare abstract class TypedRowRender<T> {
    /**
     * This method will be called for each line of a stream before method "parse" will be called.
     * @param {string} sourceName - name of source
     * @returns {boolean} - true - method "parse" will be called for this line; false - parser will be ignored
     */
    abstract isTypeMatch(sourceName: string): boolean;
    /**
     * This method will return one of the supported types of custom renders:
     * - columns
     * - external
     * @returns {ETypedRowRenders} - type of custom render
     */
    abstract getType(): ETypedRowRenders;
    /**
     * Should return an implementation of custom render. An instance of one of the next renders:
     * - TypedRowRenderAPIColumns
     * - TypedRowRenderAPIExternal
     */
    abstract getAPI(): T;
}
```

### Example - TypedRowRender

> **IMPORTANT**: It's important to note, that `TypedRowRender` **cannot** be used by itself, but instead used to create `TypedRowRenderAPIColumns` and `TypedRowRenderAPIExternal` renderers. For examples and further information check out the sections <a href="#trrCol">TypedRowRenderAPIColumns</a> and <a href="#trrExt">TypedRowRenderAPIExternal</a>

<h2 id="ident"> Identification </h2>

The abstract classes listed below are necessary for the **identification and registration** of the plugin.

<h3 id="ngModule">PluginNgModule</h3>

```Javascript
// Typescript

/**
 * Root module class for Angular plugin. Should be used by the developer of a plugin (based on Angular) to
 * let core know, which module is a root module of plugin.
 * One plugin can have only one instance of this module.
 * @usecases views, complex components, addition tabs, Angular components
 * @requirements Angular, TypeScript
 * @class PluginNgModule
 */
export declare class PluginNgModule {
    constructor(name: string, description: string) {}
}
```

### Example - PluginNgModule

This example shows how to create a simple plugin along with the usage of `PluginNgModule`:

<div class="tab ng">
  <button class="tablinks active" onclick="openCode(event, 'ng_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'ng_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'ng_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ng_module.ts')">module.ts</button>
</div>

<div id="ng_template.html" class="tabcontent ng active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="ng_styles.less" class="tabcontent ng">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="ng_component.ts" class="tabcontent ng">
<pre><code class="language-Javascript">
import { Component } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',                                // Choose the selector name of the plugin
    templateUrl: './template.html',                     // Assign HTML file as template
    styleUrls: ['./styles.less']                        // Assign LESS file as style sheet file})
export class ExampleComponent {
    constructor() { }
}
</code></pre>
</div>

<div id="ng_module.ts" class="tabcontent ng">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // <-- The module class of the plugin extends from Toolkit.PluginNgModule
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<h3 id="ps">PluginService</h3>

```Javascript
// Typescript

/**
 * Service which can be used to get access to plugin API
 * Plugin API has a collection of methods to listen to major core events and
 * communicate between render and host of plugin.
 * Into plugin's Angular components (like tabs, panels, and dialogs) API object will be
 * delivered via inputs of a component. But to have global access to API developer can
 * create an instance of this class.
 *
 * Note: an instance of this class should be exported with PluginNgModule (for Angular plugins) or
 * with PluginServiceGate.setPluginExports (for none-Angular plugins)
 *
 * @usecases Create global (in the scope of plugin) service with access to plugin's API and core's API
 * @class PluginService
 */
export declare abstract class PluginService {
    private _apiGetter;
    /**
     * @property {Subject<boolean>} onAPIReady subject will be emitted on API is ready to use
     */
    onAPIReady: Subject<boolean>;
    /**
     * Should be used to get access to API of plugin and core.
     * Note: will return undefined before onAPIReady will be emitted
     * @returns {API | undefined} returns an instance of API or undefined if API isn't ready to use
     */
    getAPI(): IAPI | undefined;
}
```

### Example - PluginService

This example shows how to create a service class, that extends from `PluginService`, which allows global access to the `API` by import the service class:

<div class="tab ps">
  <button class="tablinks active" onclick="openCode(event, 'ps_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'ps_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'ps_service.ts')">service.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ps_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ps_module.ts')">module.ts</button>
</div>

<div id="ps_template.html" class="tabcontent ps active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="ps_styles.less" class="tabcontent ps">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="ps_service.ts" class="tabcontent ps">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
export class Service extends Toolkit.PluginService {                    // The service class has to inherit the PluginService from chipmunk.client.toolkit to get access the the API methods
    private api: Toolkit.IAPI | undefined;                              // Instance variable to assign API
    constructor() {
        super();                                                        // Call parent constructor
    }
    private _onReady() {                                                // Method to be called when the API is ready
        this.api = this.getAPI();                                       // Assign the API to instance variable
        if (this.api === undefined) {                                   // Check if the API is defined to prevent errors
            console.log('API not defined!');
            return;
        }
    }
    public printID(): string {
        console.log(`Session id: ${this.api.getActiveSessionId()}`);    // Prints session ID in the console
    }
}
export default (new Service());                                         // Export the instantiated service class
</code></pre>
</div>

<div id="ps_component.ts" class="tabcontent ps">
<pre><code class="language-Javascript">
import { Component } from '@angular/core';
import Service from './service.ts'              // Import the service class to use in main component of plugin
@Component({
    selector: 'example',                        // Choose the selector name of the plugin
    templateUrl: './template.html',             // Assign HTML file as template
    styleUrls: ['./styles.less']                // Assign LESS file as style sheet file})
export class ExampleComponent {
    constructor() { 
            Service.printID();                  // Print session ID in the console
    }
}
</code></pre>
</div>

<div id="ps_module.ts" class="tabcontent ps">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                       // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';                 // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';             // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                         // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                               // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');           // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="ps_public_api.ts" class="tabcontent ps">
<pre><code class="language-Javascript">
import Service from './service';
export * from './component';
export * from './module';
export { Service };
</code></pre>
</div>

> **IMPORTANT**: It's important to note, that the `Service` HAS to be exported to be used globally (in scope of the plugin)

<h3 id="psg"> PluginServiceGate </h3>

```Javascript
// Typescript

/**
 * Used for none-Angular plugins to delivery plugin's exports into the core of chipmunk
 * Developer can create none-Angular plugin. In global namespace of the main javascript file will be
 * available implementation of PluginServiceGate.
 * For example:
 * =================================================================================================
 * const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;
 * gate.setPluginExports({
 *     parser: new MyParserOfEachRow(),
 * });
 * =================================================================================================
 * This code snippet registered a new parser for output "MyParserOfEachRow"
 * @usecases should be used for none-angular plugins to register parsers
 * @class PluginServiceGate
 */
export declare abstract class PluginServiceGate {
    /**
     * Internal usage
     */
    abstract setPluginExports(exports: IPluginExports): void;
    /**
     * Internal usage
     */
    abstract getCoreModules(): ICoreModules;
    /**
     * Internal usage
     */
    abstract getRequireFunc(): TRequire;
}
```

### Example - PluginServiceGate

This example shows how to create a parser, that puts '-->' in front of every line in the output.

<div class="tab psg">
  <button class="tablinks active" onclick="openCode(event, 'psg_index.ts')">index.ts</button>
</div>

<div id="psg_index.ts" class="tabcontent psg active">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';                                                 // Import front-end API to extend Parser class
class ParseMe extends Toolkit.RowCommonParser {                                                     // Extend parser class with Abstract parser class 
    public parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo): string {    // Create parser which modifies and returns parsed string
        return `--> ${str}`;                                                                        // Return string with --> in front
    }
} 
const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;                      // <-- Usage of PluginServiceGate, Identification of the plugin
if (gate === undefined) {                                                                           // If binding didn't work print out error message
    console.error(`Fail to find logviewer gate.`);
} else {
    gate.setPluginExports({                                                                         // Set parser(s) to export here (Setting Multiple parsers possible)
        parser: new ParseMe()                                                                       // Create parser instance (Free to choose parser name)
    });
}
</code></pre>
</div>

<h3 id="trrCol"> TypedRowRenderAPIColumns </h3>

```Javascript
// Typescript

export interface IColumnWidth {
    width: number;
    min: number;
}

/**
 * Allows presenting a line of a stream as a collection of columns.
 * It should be used with TypedRowRender class (as a generic class), like:
 *
 * class TypedRowRender<TypedRowRenderAPIColumns> { ... }
 *
 * @usecases decode / convert line of stream and show it as columns
 * @requirements TypeScript or JavaScript
 * @class TypedRowRenderAPIColumns
 */
export abstract class TypedRowRenderAPIColumns {
    /**
     * Should returns headers of columns
     * @returns {string[]} headers of columns
     */
    public abstract getHeaders(): string[];

    /**
     * Should return values of columns
     * @param {string} str - single line from stream
     * @returns {string[]} values of columns
     */
    public abstract getColumns(str: string): string[];

    /**
     * Should return default widths of columns
     * @returns {IColumnWidth[]} widths of columns
     */
    public abstract getDefaultWidths(): IColumnWidth[];

}
```

### Example - TypedRowRenderAPIColumns

<div class="tab trrc">
  <button class="tablinks active" onclick="openCode(event, 'trrc_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'trrc_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'trrc_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trrc_row_columns_api.ts')">row.columns_api.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trrc_row_columns.ts')">row.columns.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trrc_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trrc_public_api.ts')">public_api.ts</button>
</div>

<div id="trrc_public_api.ts" class="tabcontent trrc active">
<pre><code class="language-Javascript">
import { ExampleRowRender } from './lib/row/render';    // Import the renderer
const externalRowRender = new ExampleRowRender();       // Instanticate the renderer once
export { externalRowRender };                           // Export the instantiated renderer
export * from './lib/component';
export * from './module';
</code></pre>
</div>

<div id="trrc_module.ts" class="tabcontent trrc">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';
import { ExampleComponent } from './lib/component';
import { ExampleRowComponent } from './lib/row/component';
import * as Toolkit from 'chipmunk.client.toolkit';
@NgModule({
    entryComponents: [ ExampleComponent ],
    declarations: [ ExampleComponent ],
    imports: [ ],
    exports: [ ExampleComponent ]
})
export class PluginModule extends Toolkit.PluginNgModule {
    constructor() {
        super('Example', 'Provides access to example plugin');
    }
}
</code></pre>
</div>

<div id="trrc_component.ts" class="tabcontent trrc">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: Toolkit.EViewsTypes.sidebarVertical,
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class SidebarVerticalComponent {
    @Input() public api: Toolkit.IAPI;                  // Assign API to instance variable
    @Input() public session: string;                    // Assign session ID to instance variable
    constructor() {
        this.api.getIPC().send({                        // Send session ID to back-end of plugin
            stream: this.session,
            command: 'session'
        }).catch((error: Error) => {
            console.log('Error occured');
        });
    }
}
</code></pre>
</div>

<div id="trrc_styles.less" class="tabcontent trrc">
<pre><code class="language-CSS">
p{
    color: #ffffff
}
</code></pre>
</div>

<div id="trrc_template.html" class="tabcontent trrc">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="trrc_row_columns_api.ts" class="tabcontent trrc">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
export const CDelimiters = {
    columns: '\u0004',
    arguments: '\u0005',
};
export const CColumnsHeaders = [                                                        // Colmun headers for table like view
    'WORD 0',
    'WORD 1',
    'WORD 2',
];
export class ExampleRowColumnsAPI extends Toolkit.TypedRowRenderAPIColumns {
    constructor() {
        super();
    }
    public getHeaders(): string[] {                                                     // Getter method for headers
        return CColumnsHeaders;
    }
    public getColumns(str: string): string[] {                                          // Split stream to words by TAB
        return str.split('\t');
    }
    public getDefaultWidths(): Array<{ width: number, min: number }> {                  // Define width of columns
        return [
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
        ];
    }
}
</code></pre>
</div>

<div id="trrc_row_columns.ts" class="tabcontent trrc">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
import { ExampleRowColumnsAPI } from './row.columns.api';
export class ExampleRowColumns extends Toolkit.TypedRowRender<ExampleRowColumnsAPI> {   // Create new column renderer of API type defined in ExampleColumnsAPI
    private _api: ExampleRowColumnsAPI = new ExampleRowColumnsAPI();
    constructor() {
        super();
    }
    public getType(): Toolkit.ETypedRowRenders {                                        // Getter method for renderer type
        return Toolkit.ETypedRowRenders.columns;
    }
    public isTypeMatch(fileName: string): boolean {                                     // Method to check if opened file is a .txt file
        if (fileName.search(/\.txt/) > -1) {
            return true;
        }
    }    
    public getAPI(): ExampleRowColumnsAPI {                                             // Getter method for API
        return this._api;
    }
}
</code></pre>
</div>

> **NOTE**: To test this plugin, create a `.txt` file with some text in it and the words being seperated by `\t`.

<h3 id="trrExt"> TypedRowRenderAPIExternal </h3>

```Javascript
// Typescript

const CSignature = 'TypedRowRenderAPIExternal';

/**
 * Allows injecting Angular component into view as each row render
 * It should be used with TypedRowRender class (as a generic class), like:
 *
 * class TypedRowRender<TypedRowRenderAPIExternal> { ... }
 *
 * @usecases decode / convert line of stream and show with specific render
 * @requirements Angualr, TypeScript
 * @class TypedRowRenderAPIExternal
 */
export abstract class TypedRowRenderAPIExternal {
    /**
     * This method should return angular's component selector.
     * Note: plugin should already have an implementation of the component,
     * which will be used as render. Selector of such component should
     * be returned here.
     * @returns {string} angular's component selector
     */
    public abstract getSelector(): string;

    /**
     * Method returns inputs for render component
     * @returns { { [key: string]: any } } inputs for render-components
     */
    public abstract getInputs(): { [key: string]: any };
}
```

### Example - TypedRowRenderAPIExternal

**Front-end**

<div class="tab trre">
  <button class="tablinks active" onclick="openCode(event, 'trreR_template.html')">/row/template.html</button>
  <button class="tablinks" onclick="openCode(event, 'trreR_styles.less')">/row/styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'trreR_component.ts')">/row/component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trre_render_api.ts')">/row/render_api.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trre_render.ts')">/row/render.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trre_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'trre_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'trre_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trre_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'trre_public_api.ts')">public_api.ts</button>
</div>

<div id="trre_render_api.ts" class="tabcontent trre active">
<pre><code class="language-Javascript">
import * from 'chipmunk.client.toolkit';
export class ExampleRowRenderAPI extends Toolkit.TypedRowRenderAPIExternal {
    private _selector: string = 'lib-example-row-component';                    // Create component selector name
    constructor() {
        super();
    }
    public getSelector(): string {                                              // Getter method for the Angular component selector (HTML tag name)
        return this._selector;
    }
    public getInputs(): { [key: string]: any } {                                // Getter method for inputs for renderer component
        return { service: null };
    }
}
</code></pre>
</div>

<div id="trre_render.ts" class="tabcontent trre">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
import { ExampleRowRenderAPI } from './render.api';
export class ExampleRowRender extends Toolkit.TypedRowRender<ExampleRowRenderAPI> {     // Extend renderer from TypedRowRenderer with the ExampleRowRendererAPI type (declared above)
    private _api: ExampleRowRenderAPI = new ExampleRowRenderAPI();                      // Instantiate renderer API to assign API to instance variable
    constructor() {
        super();
    }
    public getType(): Toolkit.ETypedRowRenders {                                        // Getter method for the type of the renderer
        return Toolkit.ETypedRowRenders.external;
    }
    public isTypeMatch(sourceName: string): boolean {                                   // Check if the source of the message is from the plugin
        return sourceName === 'example';
    }
    public getAPI(): ExampleRowRenderAPI {                                              // Getter method for API
        return this._api;
    }
}
</code></pre>
</div>

<div id="trreR_component.ts" class="tabcontent trre">
<pre><code class="language-Javascript">
import { Component, OnDestroy, ChangeDetectorRef, AfterViewInit, AfterContentInit, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as Toolkit from 'chipmunk.client.toolkit';
import { Subscription, Subject } from 'rxjs';
@Component({
    selector: 'lib-example-row-component',
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class ExampleRowComponent implements AfterViewInit, OnDestroy, AfterContentInit {
    @Input() public api: Toolkit.IAPI;                                                                          // Assign API to instance variable
    @Input() public session: string;                                                                            // Assign session ID to instance variable
    @Input() public html: string;                                                                               // Assign message from stream to instance variable
    @Input() public update: Subject<{ [key: string]: any }>;                                                    // Assign subscription object for changes to instance variable
    public _ng_html: SafeHtml;                                                                                  // Instance variable to save message of the stream
    private _subscriptions: { [key: string]: Subscription } = {};
    private _destroyed: boolean = false;
    constructor(private _cdRef: ChangeDetectorRef, private _sanitizer: DomSanitizer) { }
    public ngOnDestroy() {
        this._destroyed = true;
        Object.keys(this._subscriptions).forEach((key: string) => {                                             // Unsubscribe from all sources when the object is destroyed
            this._subscriptions[key].unsubscribe();
        });
    }
    public ngAfterViewInit() {
        if (typeof this.html !== 'string') {                                                                    // Check for correct format of stream message to prevent errors
            return;
        }
        this._getHTML();
    }
    public ngAfterContentInit() {
        if (this.update === undefined) {                                                                        // Error prevention by checking if the object to subscribe exists
            return;
        }
        this._subscriptions.update = this.update.asObservable().subscribe(this._onInputsUpdated.bind(this));    // Subscribe to the changes occuring on the input/stream
    }
    private _onInputsUpdated(inputs: any) {                                                                     // Method to be called upon changes on the input/stream
        if (inputs === undefined || inputs === null) {
            return;
        }
        if (typeof inputs.html === 'string' && inputs.html !== this.html) {                                     // Check for the right format of the message
            this.html = inputs.html;                                                                            // Assign message from stream to string for HTML element
            this._getHTML();                                                                                    // Security procedure
        }
    }
    private _getHTML() {
        this._ng_html = this._sanitizer.bypassSecurityTrustHtml(this.html);                                     // Processes received message to increase security
        this._forceUpdate();                                                                                    // Update HTML elements
    }
    private _forceUpdate() {                                                                                    // Method to update HTML elements
        if (this._destroyed) {
            return;
        }
        this._cdRef.detectChanges();
    }
}
</code></pre>
</div>

<div id="trreR_styles.less" class="tabcontent trre">
<pre><code class="language-CSS">
span.dot{
    height: 15px;
    width: 15px;
    background-color: #FF0000;
    border-radius: 50%;
    display: inline-block;
}
span.content{
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="trreR_template.html" class="tabcontent trre">
<pre><code class="language-HTML">
&lt;span class="dot"&gt;&lt;/span&gt;                               &lt;!-- Rendered line puts a dot (modified in LESS file) --&gt;
&lt;span class="content" [innerHTML]="_ng_html"&gt;&lt;/span&gt;    &lt;!-- Next to the dot comes the actual message --&gt;
</code></pre>
</div>

<div id="trre_public_api.ts" class="tabcontent trre">
<pre><code class="language-Javascript">
import { ExampleRowRender } from './lib/row/render';    // Import renderer to instantiate
const externalRowRender = new ExampleRowRender();       // Instantiate renderer
export { externalRowRender };                           // Export it to make it available in the application
export * from './lib/component';
export * from './module';
</code></pre>
</div>

<div id="trre_module.ts" class="tabcontent trre">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';
import { ExampleComponent } from './lib/component';
import { ExampleRowComponent } from './lib/row/component';
import * as Toolkit from 'chipmunk.client.toolkit';
@NgModule({
    entryComponents: [ ExampleComponent, SerialRowComponent ],
    declarations: [ ExampleComponent, SerialRowComponent ],
    imports: [ ],
    exports: [ ExampleComponent, SerialRowComponent ]
})
export class PluginModule extends Toolkit.PluginNgModule {
    constructor() {
        super('Example', 'Provides access to example plugin');
    }
}
</code></pre>
</div>

<div id="trre_component.ts" class="tabcontent trre">
<pre><code class="language-Javascript">
import { Component, Input } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: Toolkit.EViewsTypes.sidebarVertical,
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class SidebarVerticalComponent {
    @Input() public api: Toolkit.IAPI;                  // Assign API to instance variable
    @Input() public session: string;                    // Assign session ID to instance variable 
    constructor() {
        this.api.getIPC().send({                        // Send session ID to the back-end
            stream: this.session,
            command: 'session'
        }).catch((error: Error) => {
            console.log('Error occured');
        });
    }
}
</code></pre>
</div>

<div id="trre_styles.less" class="tabcontent trre">
<pre><code class="language-CSS">
p {
    color: #ffffff
}
</code></pre>
</div>

<div id="trre_template.html" class="tabcontent trre">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

**Back-end**

<div class="tab trreB">
  <button class="tablinks active" onclick="openCode(event, 'trre_main.ts')">main.ts</button>
</div>

<div id="trre_main.ts" class="tabcontent trreB active">
<pre><code class="language-Javascript">
import PluginIPCService, { IPCMessages } from 'chipmunk.plugin.ipc';
class ExampleBackend {
    public static count = 0;                                                                                    // Create counting variable
    constructor(){      
        this._onIncomeRenderIPCMessage = this._onIncomeRenderIPCMessage.bind(this);                             // Bind method for subscription
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncomeRenderIPCMessage);          // Subscribe to messages from the front-end
    }
    private _onIncomeRenderIPCMessage(message: IPCMessages.PluginInternalMessage) {                             // Create method to listen to messages from the front-end
        if (message.data.command === 'session') {                                                               // Check if the session ID have been sent
            this.send(message.stream);
        } else {
            console.warn(`Unknown command: ${message.data.command}`);
        }
    }
    private send(stream: string) {                                                                              // When the session ID has been sent
        if(ExampleBackend.count <= 10) {                                                                        // Send every 500ms 10 times "Hello World! No.: <Counted times>" to the front-end
            return setTimeout(() => {
                ExampleBackend.count++;
                PluginIPCService.sendToStream(new Buffer(`Hello World! No.: ${ExampleBackend.count}`, 'utf-8'), stream);
                this.send(stream);
            }, 500);
        }
    }
}
export default new ExampleBackend();
</code></pre>
</div>


<h2 id="ipc"> IPC </h2>

These abstract classes allow to create different methods to establish communication between the **back-end** and the **front-end**.

> **IMPORTANT**: `IPC` is only used in the **back-end**

```Javascript
// Typescript

/**
 * @class IPC
 * Abstract class, which used for creating a plugin IPC controller.
 * Plugin IPC controller allows communicating between render part of a plugin
 * and backend part of a plugin.
 * Render part (render) - a plugin's part, which executes on front-end in browser
 * Backend part (host) - a plugin's part, which executes on back-end on nodejs level
 */

export declare abstract class IPC {
    readonly token: string;
    readonly name: string;
    private _logger;
    private _handlers;
    constructor(name: string, token: string) {}
    /**
     * Sends message from render to host.
     * Note: this method doesn't wait for host's response. It's just a sender. This method could be used for example
     * for emitting of events or something like it.
     * @param {any} message - any message to be sent on host
     * @param streamId - id of related stream
     * @returns {Promise<void>} resolved on message successfully sent; reject on sending errors
     */
    abstract send(message: any, streamId?: string): Promise<void>;
    /**
     * Sends a request from render to host.
     * This method sends request-message to host and waits for a response.
     * @param {any} message - any message to be sent on host. As usual, it's an object
     * @param {string} streamId - id of related stream
     * @returns {Promise<void>} resolved with host's response; reject on sending errors
     */
    abstract request(message: any, streamId?: string): Promise<any>;
    /**
     * Subscriber to host messages
     * @param {(message: any) => void} handler - will be called with each host message
     * @returns {Subscription} subscription object, which could be used to unsubscribe
     */
    subscribe(handler: Tools.THandler): Tools.Subscription;
}
```

### Example - IPC

This example shows a **Complex plugin** with two buttons demonstrating how to communicate **front-end** <-> **back-end**.

> **NOTE**: To make use of `IPC` add `IAPI` in the code, since `IAPI` holds the method `getIPC()` which provides an instance of `IPC` with the methods already implemented. (For more information: <a href="#iapi">IAPI</a>) 

## Front-end

<div class="tab ipc">
  <button class="tablinks active" onclick="openCode(event, 'ipc_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'ipc_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'ipc_service.ts')">service.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ipc_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ipc_public_api.ts')">public_api.ts</button> 
</div>

<div id="ipc_template.html" class="tabcontent ipc active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_onRequest()">'request' to backend&lt;/button&gt    &lt;!-- Create button for request-type of message --&gt; 
&lt;button (click)=&quot;_ng_onSend()">'send' to backend&lt;/button&gt          &lt;!-- Create button for send-type of message --&gt;
</code></pre>
</div>

<div id="ipc_styles.less" class="tabcontent ipc">
<pre><code class="language-CSS">
p {
    color: white;
}
button {
    position: relative;
    width: 47%;
    height: 3%;
    margin-left: 2%;
    margin-top: 5%;
    color: black;
}
</code></pre>
</div>

<div id="ipc_service.ts" class="tabcontent ipc">
<pre><code class="language-Javascript">
import * as Toolkit from 'chipmunk.client.toolkit';
export class Service extends Toolkit.PluginService {                                                                                // The service class has to inherit the PluginService from chipmunk.client.toolkit to get access the the API methods
    private api: Toolkit.IAPI | undefined;                                                                                          // Instance variable to assign API
    constructor() {
        super();                                                                                                                    // Call parent constructor
        this._subs.onReady = this.onAPIReady.subscribe(this._onAPIReady.bind(this));                                                // Subscribe to the onAPIReady method from the API to see when the API is ready
    }
    private _onAPIReady() {                                                                                                         // Method to be called when the API is ready
        this.api = this.getAPI();                                                                                                   // Assign the API to instance variable
        if (this.api === undefined) {                                                                                               // Check if the API is defined to prevent errors
            console.log('API not defined!');
            return;
        }
        this._subscriptions.onTabOpen = this.api.getSessionsEventsHub().subscribe().onTabOpen(this._onTabOpen.bind(this));          // Subscribe to the API to call method upon opening a new session/tab
        this._subscriptions.onTabClose = this.api.getSessionsEventsHub().subscribe().onTabClose(this._onTabClose.bind(this));       // Subscribe to the API to call method upon closing a session/tab
        this._subscriptions.onTabChange = this.api.getSessionsEventsHub().subscribe().onTabChange(this._onTabChange.bind(this));    // Subscribe to the API to call method upon changing to another session/tab
    }
    private _onSessionOpen() {                                                                                                      // Method to call upon opening a new session/tab
        this.session = this.api.getActiveSessionId();                                                                               // Get active session ID
        if (this.sessions.includes(this.session)) {                                                                                 // Check if session already exists to prevent double entries
            return;
        }
        if (this.sessions.length === 0) {
            this.incomeMessage();                                                                                                   // Subscribe only if the first session was created
        }
        this.sessions.push(this.session);                                                                                           // Add the session to the list of sessions
    }
    private _onSessionClose(guid: string) {                                                                                         // Method to call upon closing a session/tab
        this.sessions = this.sessions.filter(session => session !== guid);                                                          // Remove closed session from list of sessions
    }
    private _onSessionChange(guid: string) {                                                                                        // Method to call upon changing to another session/tab
        this.session = guid;
    }
    public incomeMessage() {
        this._subscriptions.incomeIPCHostMessage = this.api.getIPC().subscribe((message: any) => {
            if (typeof message !== 'object' && message === null) {
                return;
            }
            if (message.event === 'send') {                                                                                         // Check if it's the expected message
                console.log(`Received onSend: ${message.data.msg}`);                                                                // Print out the message in the console
            }
        });
    }
    public _ng_onRequest() {                                                                                                        // on click function for request-type of message to the back-end
        if (this.api) {                                                                                                             // check if API exists
            this.api.getIPC().request({                                                                                             // send request-type of message to the back-end
                stream: this.session,
                command: 'request'
            }, this.session).then((response) => {                                                                                   // Catch response from back-end
                console.log(`Received onRequest: ${response.msg}`);                                                                 // Print out responsed answer in the console
            }).catch((error: Error) => {
                console.error(error);
            });
      } else {
        console.error('No API found!');
      }
    }
    public _ng_onSend() {                                                                                                           // on click function for send-type of message to the back-end
        if (this.api) {                                                                                                             // check if API exists
            this.api.getIPC().send({                                                                                                // send send-type of message to the back-end
                stream: this.session,
                command: 'send'
            }, this.session).catch((error: Error) => {
                console.error(error);
            });
        } else {
            console.error('No API found!');
        }
    }
}
export default (new Service());                                                                                                     // Export the instantiated service class
</code></pre>
</div>

<div id="ipc_module.ts" class="tabcontent ipc">
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

<div id="ipc_public_api.ts" class="tabcontent ipc">
<pre><code class="language-Javascript">
import Service from './service';
export * from './component';
export * from './module';
export { Service };
</code></pre>
</div>

> **IMPORTANT**: It's important to note, that the `Service` HAS to be exported to be used globally (in scope of the plugin)

> **NOTE**: Using a service file is one of two ways to make use of the `API` (check out _How to use the API_ in <a href="#api">API</a> for more information)

## Back-end

<div class="tab ipcB">
  <button class="tablinks active" onclick="openCode(event, 'ipc_main.ts')">main.ts</button>
</div>

<div id="ipc_main.ts" class="tabcontent ipcB active">
<pre><code class="language-Javascript">
import PluginIPCService from 'chipmunk.plugin.ipc';
import { IPCMessages } from 'chipmunk.plugin.ipc';
class Plugin {
    constructor() {
        this._onIncome = this._onIncome.bind(this);
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncome);                              // <-- Usage of PluginIPCService - Subscribe to incoming messages from front-end
    }
    private _onIncome(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {   // Message handler for messages from the front-end
        switch (message.data.command) {                                                                             // Check incoming command in message from front-end
            case 'request':
                return response(new IPCMessages.PluginInternalMessage({                                             // Send response to the front-end
                    data: {
                        msg: '\'request\' was successful!'                                                          // Attach string to response
                    },
                    token: message.token,
                    stream: message.stream
                }));
            case 'send':
                return PluginIPCService.sendToPluginHost(message.stream, {                                          // <-- Usage of PluginIPCService - Send message to front-end
                    data: {
                        msg: '\'send\' was successful!'                                                             // Attach string to message
                    },
                    event: 'send',
                    streamId: message.stream
                })
            default:
                console.warn(`Unknown command: ${message.data.command}`);
        }
    }
}
const app: Plugin = new Plugin();
</code></pre>
</div>

<h1 id="api_class"> API - Classes </h1>

<h2 id="ipc_service"> PluginIPCService </h2>

```Javascript
// Typescript

/**
 * @class PluginIPCService
 * @description Service provides communition between plugin's process and parent (main) process
export declare class PluginIPCService extends EventEmitter {
    private _pending;
    private _subscriptions;
    private _handlers;
    private _token;
    private _id;
    private _tokenSubscription;
    private _sockets;
    static Events: {
        close: string;
        closeStream: string;
        openStream: string;
    };
    Events: {
        close: string;
        closeStream: string;
        openStream: string;
    };
    constructor() {}
    sendToPluginHost(session: string, message: any): Promise<any>;
    requestToPluginHost(session: string, message: any): Promise<any>;
    /**
     * Sends message to parent (main) process via IPC without expecting any answer
     * @param {IPCMessages.TMessage} data package of data
     * @returns { Promise<void> }
     */
    send(message: IPCMessages.TMessage): Promise<IPCMessages.TMessage | undefined>;
    response(sequence: string, message: IPCMessages.TMessage): Promise<IPCMessages.TMessage | undefined>;
    /**
     * Sends message to parent (main) process via IPC and waiting for a answer
     * @param {IPCMessages.TMessage} data package of data
     * @returns { Promise<IPCMessages.TMessage | undefined> }
     */
    request(message: IPCMessages.TMessage): Promise<IPCMessages.TMessage | undefined>;
    subscribe(message: Function, handler: THandler): Promise<Subscription>;
    /**
     * Sends chunk of data to data's stream
     * @param {any} chunk package of data
     * @param {string} streamId id of target stream
     * @returns { Promise<void> }
     */
    sendToStream(chunk: Buffer, streamId: string): Promise<void>;
    /**
     * Pipe readable stream with session stream.
     * @returns { Error | undefined } returns errors if stream isn't found
     */
    pipeWithStream(readStream: Stream.Readable, info: IPipedStreamInfo, streamId: string): Promise<void>;
    /**
     * Returns write stream. Can be used to pipe write stream with source of data
     * @returns { Net.Socket }
     */
    private _getStreamSocket;
    /**
     * Sends message to parent (main) process via IPC
     * @param {IPCMessage} data package of data
     * @param {boolean} expectResponse  true - promise will be resolved with income message with same "sequence";
     *                                  false (default) - promise will be resolved afte message be sent
     * @returns { Promise<IPCMessage | undefined> }
     */
    private _send;
    /**
     * Handler of incoming message from parent (main) process
     * @returns void
     */
    private _onMessage;
    private _acceptSocket;
    private _removeSocket;
    private _getRefToMessageClass;
    private _isValidMessageClassRef;
    private _unsubscribe;
    private _onPluginToken;
}
```

### Example

This example shows a **Complex plugin** with two buttons demonstrating how to communicate **front-end** <-> **back-end**.

## Front-end

<div class="tab pipc">
  <button class="tablinks active" onclick="openCode(event, 'pIPC_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'pIPC_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'pIPC_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'pIPC_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'pIPC_public_api.ts')">public_api.ts</button>
</div>

<div id="pIPC_component.ts" class="tabcontent pipc active">
<pre><code class="language-Javascript">
import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
@Component({
    selector: 'example',
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class ExampleComponent implements AfterViewInit, OnDestroy {
    @Input() public api: Toolkit.IAPI;                                                              // API assignment
    @Input() public session: string;                                                                // Session ID assignment
    private _subscriptions: { [key: string]: Toolkit.Subscription } = {};                           // Hashlist for session events
    constructor() { }
    ngOnDestroy() {
        Object.keys(this._subscriptions).forEach((key: string) => {                                 // Unsubscribe from all sources when the component is destroyed
            this._subscriptions[key].unsubscribe();
        });
    }
    ngAfterViewInit() {
        this._subscriptions.incomeIPCHostMessage = this.api.getIPC().subscribe((message: any) => {  // Subscribe to back-end to listen for messages
            if (typeof message !== 'object' && message === null) {                                  // Check for correct format of message
                return;
            }
            if (message.event === 'send') {                                                         // Check if it's the expected message
                console.log(`Received onSend: ${message.data.msg}`);                                // Print out the message in the console
            }
        });
    }
    public _ng_onRequest() {                                                                        // on click function for request-type of message to the back-end
        if (this.api) {                                                                             // check if API exists
            this.api.getIPC().request({                                                             // send request-type of message to the back-end
                stream: this.session,
                command: 'request'
            }, this.session).then((response) => {                                                   // Catch response from back-end
                console.log(`Received onRequest: ${response.msg}`);                                 // Print out responsed answer in the console
            }).catch((error: Error) => {
                console.error(error);
            });
      } else {
        console.error('No API found!');
      }
    }
    public _ng_onSend() {                                                                           // on click function for send-type of message to the back-end
        if (this.api) {                                                                             // check if API exists
            this.api.getIPC().send({                                                                // send send-type of message to the back-end
                stream: this.session,
                command: 'send'
            }, this.session).catch((error: Error) => {
                console.error(error);
            });
        } else {
            console.error('No API found!');
        }
    }
}
</code></pre>
</div>

<div id="pIPC_module.ts" class="tabcontent pipc">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';
import { ExampleComponent } from './component';
import * as Toolkit from 'chipmunk.client.toolkit';
@NgModule({
  declarations: [ExampleComponent],                         // Declare which components, directives and pipes belong to the module
  imports: [ ],                                             // Imports other modules with the components, directives and pipes that components in the current module need
  exports: [ExampleComponent]                               // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
  constructor() {
      super('Example', 'Creates a template plugin');        // Call the constructor of the parent class
  }
}
</code></pre>
</div>

<div id="pIPC_styles.less" class="tabcontent pipc">
<pre><code class="language-CSS">
p {
    color: white;
}
button {
    position: relative;
    width: 47%;
    height: 3%;
    margin-left: 2%;
    margin-top: 5%;
    color: black;
}
</code></pre>
</div>

<div id="pIPC_template.html" class="tabcontent pipc">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_onRequest()"&gt;'request' to backend&lt;/button&gt;    &lt;!-- Create button for request-type of message --&gt; 
&lt;button (click)=&quot;_ng_onSend()"&gt;'send' to backend&lt;/button&gt;          &lt;!-- Create button for send-type of message --&gt;
</code></pre>
</div>

<div id="pIPC_public_api.ts" class="tabcontent pipc">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

## Back-end

<div class="tab pipcB">
  <button class="tablinks active" onclick="openCode(event, 'pIPC_main.ts')">main.ts</button>
</div>

<div id="pIPC_main.ts" class="tabcontent pipcB active">
<pre><code class="language-Javascript">
import PluginIPCService from 'chipmunk.plugin.ipc';
import { IPCMessages } from 'chipmunk.plugin.ipc';
class Plugin {
    constructor() {
        this._onIncome = this._onIncome.bind(this);
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncome);                              // <-- Usage of PluginIPCService - Subscribe to incoming messages from front-end
    }
    private _onIncome(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {   // Message handler for messages from the front-end
        switch (message.data.command) {                                                                             // Check incoming command in message from front-end
            case 'request':
                return response(new IPCMessages.PluginInternalMessage({                                             // Send response to the front-end
                    data: {
                        msg: '\'request\' was successful!'                                                          // Attach string to response
                    },
                    token: message.token,
                    stream: message.stream
                }));
            case 'send':
                return PluginIPCService.sendToPluginHost(message.stream, {                                          // <-- Usage of PluginIPCService - Send message to front-end
                    data: {
                        msg: '\'send\' was successful!'                                                             // Attach string to message
                    },
                    event: 'send',
                    streamId: message.stream
                })
            default:
                console.warn(`Unknown command: ${message.data.command}`);
        }
    }
}
const app: Plugin = new Plugin();
</code></pre>
</div>

<h2 id="service_conf"> ServiceConfig </h2>

The class `ServiceConfig` offers a variety of methods to read and write from an external file. This feature can be used to save and load settings.

> **IMPORTANT**: This module can only be used in the **back-end**

```Javascript
// Typescript

/**
 * @class ServiceConfig
 * @description Provides access to plugin configuration.
 */
export declare class ServiceConfig {
    private _path;
    private _alias;
    private _defaults;
    constructor() {}
    /**
     * As default, service trys to find path to settings folder in process.args.
     * This method can be used for manual settings path and alias
     * @param {string} _path - path to folder with settings
     * @param {string} _alias - unique alias of plugin
     */
    setup(_path: string, _alias: string): void;
    /**
     * This method store default settins.
     * Default settings will be used if any settings were not saved before
     * @param {T} defaults - defaults settings
     */
    setDefault<T>(defaults: T): void;
    /**
     * Returns settings from file.
     * @param {T} defaults - defaults settings (optional)
     * @returns {Promise<T>} - T an interface of settings
     */
    read<T>(defaults?: T): Promise<T>;
    /**
     * Saves settings into file
     * @param { {[key: string]: any} } changes - changes of settings.
     * @returns {Promise<void>}
     */
    write(changes?: {
        [key: string]: any;
    }): Promise<void>;
    /**
     * Removes plugin's setting file
     * @returns {Promise<void>}
     */
    drop(): Promise<void>;
    /**
     * Returns name of setting file (with path)
     * @returns {string}
     */
    getFileName(): string;
    private _setProp;
}
```

### Example - ServiceConfig

## Front-end

<div class="tab sc">
  <button class="tablinks active" onclick="openCode(event, 'sc_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'sc_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'sc_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'sc_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'sc_public_api.ts')">public_api.ts</button>
</div>

<div id="sc_template.html" class="tabcontent sc active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_onRead()"&gt;Read settings&lt;/button&gt;                               &lt;!-- Create button read settings --&gt;
&lt;button (click)=&quot;_ng_onWrite({id: 1234, name: 'Example'})"&gt;Write settings&lt;/button&gt;  &lt;!-- Create button to write settings--&gt;            
</code></pre>
</div>

<div id="sc_styles.less" class="tabcontent sc">
<pre><code class="language-CSS">
p {
    color: white;
}
button {
    position: relative;
    width: 47%;
    height: 3%;
    margin-left: 2%;
    margin-top: 5%;
    color: black;
}
</code></pre>
</div>

<div id="sc_component.ts" class="tabcontent sc">
<pre><code class="language-Javascript">
import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import * as Toolkit from 'chipmunk.client.toolkit';
interface IOptions {
    id: number;
    name: string;
}
@Component({
    selector: 'example',
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class ExampleComponent implements AfterViewInit, OnDestroy {
    @Input() public api: Toolkit.IAPI;                                                              // API assignment
    @Input() public session: string;                                                                // Session ID assignment
    private _subscriptions: { [key: string]: Toolkit.Subscription } = {};                           // Hashlist for session events
    constructor() { }
    ngOnDestroy() {
        Object.keys(this._subscriptions).forEach((key: string) => {                                 // Unsubscribe from all sources when the component is destroyed
            this._subscriptions[key].unsubscribe();
        });
    }
    ngAfterViewInit() {
        this._subscriptions.incomeIPCHostMessage = this.api.getIPC().subscribe((message: any) => {  // Subscribe to back-end to listen for messages
            if (typeof message !== 'object' && message === null) {                                  // Check for correct format of message
                return;
            }
            if (message.event === 'config') {                                                       // Check if it's the expected message
                console.log(`Configuration: ${message.data.msg}`);                                  // Print out the message in the console
            }
        });
    }
    public _ng_onRead() {                                                                           // on click function to request settings from the back-end
        if (this.api) {                                                                             // check if API exists
            this.api.getIPC().request({                                                             // send request-type of message to the back-end
                stream: this.session,
                command: 'read'
            }, this.session).then((response) => {                                                   // Catch response from back-end
                console.log(`Settings: ${response.msg}`);                                           // Print out settings in the console
            }).catch((error: Error) => {
                console.error(error);
            });
      } else {
        console.error('No API found!');
      }
    }
    public _ng_onWrite(options: IOptions) {                                                         // on click function for send-type of message to the back-end
        if (this.api) {                                                                             // check if API exists
            this.api.getIPC().request({                                                             // send send-type of message to the back-end
                stream: this.session,
                command: 'write',
                settings: options
            }, this.session).then((response) => {
                console.log(`Status: ${response.data.status}`);
            }).catch((error: Error) => {
                console.error(error);
            });
        } else {
            console.error('No API found!');
        }
    }
}
</code></pre>
</div>

<div id="sc_module.ts" class="tabcontent sc">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';
import { ExampleComponent } from './component';
import * as Toolkit from 'chipmunk.client.toolkit';
@NgModule({
  declarations: [ExampleComponent],                             // Declare which components, directives and pipes belong to the module
  imports: [ ],                                                 // Imports other modules with the components, directives and pipes that components in the current module need
  exports: [ExampleComponent]                                   // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {      // Create module class which inherits from the Toolkit module
  constructor() {
      super('Example', 'Creates a template plugin');            // Call the constructor of the parent class
  }
}
</code></pre>
</div>

<div id="sc_public_api.ts" class="tabcontent sc">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

## Back-end

<div class="tab scB">
  <button class="tablinks active" onclick="openCode(event, 'sc_main.ts')">main.ts</button>
</div>

<div id="sc_main.ts" class="tabcontent scB active">
<pre><code class="language-Javascript">
import PluginIPCService from 'chipmunk.plugin.ipc';
import { IPCMessages, ServiceConfig } from 'chipmunk.plugin.ipc';
interface IOptions {
    id: number;
    name: string;
}
interface IPort {
    [port: string]: IOptions;
};
interface IPortSettings {
    recent: IPort;
}
class Plugin {
    constructor() {
        this._onIncome = this._onIncome.bind(this);
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncome);                              // Subscribe to incoming messages from front-end
    }
    private _onIncome(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {   // Message handler for messages from the front-end
        switch (message.data.command) {                                                                             // Check incoming command in message from front-end
            case 'write':
                return ServiceConfig.write(settings).then(() => {                                                   // Override current settings
                    response(new IPCMessages.PluginInternalMessage({
                        data: {
                            status: 'done'                                                                          // Send status as response message to the front-end
                        },
                        token: message.token,
                        stream: message.stream
                    }));
                }).catch((error: Error) => {
                    reject(error);
                });
            }).catch((error: Error) => {
                this._logger.error(`Failed to write configurations due to the error: ${error.message}`);            // Log error message in case something didn't work
                return reject(error);
            });
            case 'read':
                return ServiceConfig.read<IPortSettings>().then(settings => {                                       // Read current settings
                    response(new IPCMessages.PluginInternalMessage({
                        data: {
                            msg: settings                                                                           // Forward settings as response message to the front-end
                        },
                        token: message.token,
                        stream: message.stream
                    }));
                }).catch((error: Error) => {
                    this._logger.error(`Failed to read configurations due to the error: ${error.message}`);         // Log error message in case something didn't work
                    reject(error);
                });
            default:
                console.warn(`Unknown command: ${message.data.command}`);
        }
    }
}
const app: Plugin = new Plugin();
</code></pre>
</div>

<h2 id="logger"> Logger </h2>

The `API` also offers a logger to log any kind of errors or warnings in the **front-end**.

```Javascript
// Typescript

export default class Logger {
    private _signature;
    private _parameters;
    /**
     * @constructor
     * @param {string} signature        - Signature of logger instance
     * @param {LoggerParameters} params - Logger parameters
     */
    constructor(signature: string, params?: LoggerParameters) {}
    /**
     * Publish info logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    info(...args: any[]): string;
    /**
     * Publish warnings logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    warn(...args: any[]): string;
    /**
     * Publish verbose logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    verbose(...args: any[]): string;
    /**
     * Publish error logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    error(...args: any[]): string;
    /**
     * Publish debug logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    debug(...args: any[]): string;
    /**
     * Publish environment logs (low-level stuff, support or tools)
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    env(...args: any[]): string;
    private _console;
    private _output;
    private _getMessage;
    private _getTime;
    private _log;
}
```

### Example - Logger

In the example below a plugin is created which logs a message.

<div class="tab log">
  <button class="tablinks active" onclick="openCode(event, 'log_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'log_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'log_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'log_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'log_public_api.ts')">public_api.ts</button>
</div>

<div id="log_template.html" class="tabcontent log active">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="log_styles.less" class="tabcontent log">
<pre><code class="language-CSS">
p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="log_component.ts" class="tabcontent log">
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

<div id="log_module.ts" class="tabcontent log">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
import { ExampleComponent } from './component';             // Import the class of the plugin, mentioned in the components.ts file
import * as Toolkit from 'chipmunk.client.toolkit';         // Import Chipmunk Toolkit to let the module class inherit
@NgModule({
    declarations: [ ExampleComponent ],                     // Declare which components, directives and pipes belong to the module 
    imports: [ ],                                           // Imports other modules with the components, directives and pipes that components in the current module need
    exports: [ ExampleComponent ]                           // Provides services that the other application components can use
}
export class PluginModule extends Toolkit.PluginNgModule {  // Create module class which inherits from the Toolkit module
    constructor() {
        super('Example', 'Create an example plugin');       // Call the constructor of the parent class
    }
}
</code></pre>
</div>

<div id="log_public_api.ts" class="tabcontent log">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<a href="#api">Go to top</a>