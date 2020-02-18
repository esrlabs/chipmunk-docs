<link rel="stylesheet" type="text/css" href="../styles/styles.tab.css">

<script src="../scripts/script.tab.js">
</script>

# Back-end - Complex Plugin

The **Complex plugins** consist of a **front-end** (see `Chapter 03 - Front-end` for more information) and a **back-end**.
This chapter is about the **back-end** and gives a better insight of **Complex plugins**.

## About Complex plugins
**Complex plugins** comprises of a **front-end**, which mainly provides the UI, whereas the **back-end** is more about providing functionality from 3rd-party libraries. Plugins cannot exist with a **back-end** implementation only, since the **back-end** has no way to display the results. The **back-end** can communicate with the **front-end** with the help of the <a href="05_api.html#api">`API`</a>, which is provided by **Chipmunk** (see `Chapter 05 - API` for more information).

### Example - Back-end

In this example a **Complex plugin** is created, which offers two buttons to send a command to the **back-end**, which is then returned from the **back-end** to the **front-end**. Upon receiving the message from the **back-end**, the message will be printed out in the console.
The communication between the **front-end** and the **back-end** is established by the module `IPC` of the <a href="05_api.html#api">`API`</a>, that is offered by **Chipmunk**.

> NOTE: For more information how the `API` works check out <a href="05_api.html#api">`Chapter 5 - API`</a>

## Front-end

<div class="tab befe">
  <button class="tablinks active" onclick="openCode(event, 'template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'module.ts')">module.ts</button>
</div>

<div id="component.ts" class="tabcontent befe active">
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

<div id="module.ts" class="tabcontent befe">
<pre><code class="language-Javascript">
import { NgModule } from '@angular/core';
import { ExampleComponent } from './component';
import * as Toolkit from 'chipmunk.client.toolkit';
@NgModule({
  declarations: [ExampleComponent],                                                                 // Declare which components, directives and pipes belong to the module
  imports: [ ],                                                                                     // Imports other modules with the components, directives and pipes that components in the current module need
  exports: [ExampleComponent]                                                                       // Provides services that the other application components can use
})
export class PluginModule extends Toolkit.PluginNgModule {                                          // Create module class which inherits from the Toolkit module
  constructor() {
      super('Example', 'Creates a template plugin');                                                // Call the constructor of the parent class
  }
}
</code></pre>
</div>

<div id="styles.less" class="tabcontent befe">
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

<div id="template.html" class="tabcontent befe">
<pre><code class="language-HTML">
&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_onRequest()&quot;&gt;&lt;/button&gt;   &lt;!-- Create a button for request-type of message --&gt;
&lt;button (click)=&quot;_ng_onSend()&quot;&gt;&lt;/button&gt;      &lt;!-- Create a button for send-type of message --&gt;
</code></pre>
</div>

## Back-end

<div class="tab bebe">
  <button class="tablinks active" onclick="openCode(event, 'public_api.ts')">public_api.ts</button>
  <button class="tablinks" onclick="openCode(event, 'main.ts')">main.ts</button>
</div>

<div id="public_api.ts" class="tabcontent bebe active">
<pre><code class="language-Javascript">
export * from './component';
export * from './module';
</code></pre>
</div>

<div id="main.ts" class="tabcontent bebe">
<pre><code class="language-Javascript">
import PluginIPCService from 'chipmunk.plugin.ipc';
import { IPCMessages } from 'chipmunk.plugin.ipc';
class Plugin {
    constructor() {
        this._onIncome = this._onIncome.bind(this);
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncome);                              // Subscribe to incoming messages from front-end
    }
    private _onIncome(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {   // Message handler for messages from the front-end
        // Process commands
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
                return PluginIPCService.sendToPluginHost(message.stream, {                                          // Send message to front-end
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

## Logging

To log any kind of information/error/warning/etc. simply use the console log, which will automatically save the logs in the log file of Chipmunk `chipmunk.log`.
> Windows:   `"C:\Users\userName\.chipmunk\chipmunk.log"`

> Unix:      `"/users/userName/.chipmunk/chipmunk.log"`

## Errors

A common issue known is, that changes made in the **back-end** are not being applied, even though the **back-end** has been compiled without any errors.
To resolve this issue, **delete** the folder in which the **compiled** files are located.

The following chapter gives a deeper insight into the <a href="05_api.html#api">`API`</a> provided by **Chipmunk**. The modules, abstract classes and methods will all be explained thoroughly with an example for each of them.