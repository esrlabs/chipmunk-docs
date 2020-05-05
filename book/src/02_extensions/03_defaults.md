<link rel="stylesheet" type="text/css" href="../styles/styles.extension.css">

<script src="../scripts/script.tab.js">
</script>

# Default plugins

In the first part of this section all default plugins provided by **Quickstart** will be thoroughly explained as of what they do and explain each line. In the second part other useful things such as popup windows or notifications will demonstrated with examples.

## Hello World

The plugin **Hello World** creates a button which prints 'Hello World!' in the debug console whenever it is clicked.

<pre><code>&#9500;&#9472;&#9472; process
&#9474;   &#9500;&#9472;&#9472; src
&#9474;   &#9474;   &#9492;&#9472;&#9472; main.ts
&#9474;   &#9500;&#9472;&#9472; package.json
&#9474;   &#9492;&#9472;&#9472; tsconfig.json
&#9492;&#9472;&#9472; render
    &#9500;&#9472;&#9472; src
    &#9474;   &#9500;&#9472;&#9472; lib
    &#9474;   &#9474;   &#9500;&#9472;&#9472; views
    &#9474;   &#9474;   &#9474;    &#9492;&#9472;&#9472; sidebar.vertical
    &#9474;   &#9474;   &#9474;        &#9500;&#9472;&#9472; compontent.ts
    &#9474;   &#9474;   &#9474;        &#9500;&#9472;&#9472; styles.less
    &#9474;   &#9474;   &#9474;        &#9492;&#9472;&#9472; template.html
    &#9474;   &#9474;   &#9500;&#9472;&#9472; module.ts
    &#9474;   &#9474;   &#9492;&#9472;&#9472; service.ts
    &#9474;   &#9492;&#9472;&#9472; public-api.ts
    &#9500;&#9472;&#9472; ng-package.json
    &#9500;&#9472;&#9472; package.json
    &#9500;&#9472;&#9472; tsconfig.json
    &#9500;&#9472;&#9472; tsconfig.spec.json
    &#9492;&#9472;&#9472; tslint.json
</code></pre>

<div class="tab ang">
  <button class="tablinks" onclick="openCode(event, 'ang_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'ang_styles.less')">styles.less</button>
  <button class="tablinks active" onclick="openCode(event, 'ang_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ang_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'ang_public_api.ts')">public_api.ts</button>
</div>

<div id="ang_template.html" class="tabcontent ang">
<pre><code class="language-HTML">&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_click()&quot;&gt;&lt;/button&gt;   &lt;!-- Create a button which calls _ng_click from the components.ts file --&gt;
</code></pre>
</div>

<div id="ang_styles.less" class="tabcontent ang">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
button {
    height: 20px;
    width: 50px;
}
</code></pre>
</div>

<div id="ang_component.ts" class="tabcontent ang active">
<pre><code class="language-Javascript">import { Component } from '@angular/core';  // Import the Angular component that is necessary for the setup below
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

<div id="ang_module.ts" class="tabcontent ang">
<pre><code class="language-Javascript">import { NgModule } from '@angular/core';                   // Import the Angular component that is necessary for the setup below
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

<div id="ang_public_api.ts" class="tabcontent ang">
<pre><code class="language-Javascript">export * from './lib/component';    // Export the main component of the plugin
export * from './lib/module';       // Export the module file of the plugin
</code></pre>
</div>

> **IMPORTANT**: Make sure the `PluginModule` class inherits from `Toolkit.PluginNgModule` or else the modules won't be part of the plugin!

> **IMPORTANT**: Exporting the component and module is required by Angular and necessary for the plugin to work!

## Row Columns

The plugin **Row Columns** creates a custom render for CSV files to show its conent in columns.

<pre><code>&#9492;&#9472;&#9472; render
    &#9500;&#9472;&#9472; src
    &#9474;   &#9500;&#9472;&#9472; lib
    &#9474;   &#9474;   &#9500;&#9472;&#9472; row.columns.api.ts
    &#9474;   &#9474;   &#9492;&#9472;&#9472; row.columns.api.ts
    &#9474;   &#9492;&#9472;&#9472; public-api.ts
    &#9500;&#9472;&#9472; ng-package.json
    &#9500;&#9472;&#9472; package.json
    &#9500;&#9472;&#9472; tsconfig.json
    &#9500;&#9472;&#9472; tsconfig.spec.json
    &#9492;&#9472;&#9472; tslint.json
</code></pre>

<div class="tab col">
  <button class="tablinks" onclick="openCode(event, 'col_row.columns.api.ts')">row.columns.api.ts</button>
  <button class="tablinks active" onclick="openCode(event, 'col_row.columns.ts')">row.columns.ts</button>
  <button class="tablinks" onclick="openCode(event, 'col_public_api.ts')">public_api.ts</button>
</div>

<div id="col_row.columns.api.ts" class="tabcontent col">
<pre><code class="language-Javascript">import * as Toolkit from 'chipmunk.client.toolkit';
// Delimiter for CSV files.
export const CDelimiters = [';', ',', '\t'];
// For now chipmunk supports only predefined count of columns. Developer cannot change 
// it dynamically. Here we are defining some columns headers
export const CColumnsHeaders = [
    'A',
    'B',
    'C',
    'D',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
];
let delimiter: string | undefined;
/**
 * @class ColumnsAPI
 * @description Implementation of custom row's render, based on TypedRowRenderAPIColumns
 */
export class ColumnsAPI extends Toolkit.TypedRowRenderAPIColumns {
    constructor() {
        super();
    }
    /**
     * Returns list of column's headers
     * @returns { string[] } - column's headers
     */
    public getHeaders(): string[] {
        return CColumnsHeaders;
    }
    /**
     * Should returns parsed row value as array of columns. Length of columns here
     * should be equal to length of columns (see getHeaders)
     * @param str { string } - string value of row
     * @returns { string[] } - values of columns for row
     */
    public getColumns(str: string): string[] {
        const columns: string[] = str.split(this._getDelimiter(str));
        // Because we don't know, how much columns file will have, we are adding missed
        // or removing no needed columns
        if (columns.length < CColumnsHeaders.length) {
            for (let i = CColumnsHeaders.length - columns.length; i >= 0; i += 1) {
                columns.push('-');
            }
        } else if (columns.length > CColumnsHeaders.length) {
            const rest: string[] = columns.slice(CColumnsHeaders.length - 2, columns.length);
            columns.push(rest.join(this._getDelimiter(str)));
        }
        return columns;
    }
    /**
     * This method will be called by chipmunk's core once before render column's headers.
     * @returns { Array<{ width: number, min: number }> } - default width and minimal width for
     * each column
     */
    public getDefaultWidths(): Array<{ width: number, min: number }> {
        return [
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
            { width: 50, min: 30 },
        ];
    }
    private _getDelimiter(input: string): string {
        if (delimiter !== undefined) {
            return delimiter;
        } else {
            let score: number = 0;
            CDelimiters.forEach((del: string) => {
                let length = input.split(del).length;
                if (length > score) {
                    score = length;
                    delimiter = del;
                }
            });    
        }
        return delimiter;        
    }
}
</code></pre>
</div>

<div id="col_row.columns.ts" class="tabcontent col active">
<pre><code class="language-Javascript">import * as Toolkit from 'chipmunk.client.toolkit';
import { ColumnsAPI } from './row.columns.api';
/**
 * @class Columns
 * @description Chipmunk supports custom renders for rows. It means, before row 
 * (in main view and view of search result) will be show, chipmunk will apply 
 * available custom renders. Render could be bound with type of income data. 
 * For example with type of opened file.
 * To bind render with type of income data developer should use abstract class
 * TypedRowRender. As generic class, developer should provide render, which
 * should be used for such data. 
 * In this example we are using predefined render of columns
 */
export class Columns extends Toolkit.TypedRowRender<ColumnsAPI> {
    // Store instance of custom render to avoid recreating of it with each new
    // chipmunk's core request
    private _api: ColumnsAPI = new ColumnsAPI();
    constructor() {
        super();
    }
    /**
     * This method will be called by chipmunk to detect, which kind of render we are
     * going to use.
     * @returns { ETypedRowRenders } - tells chipmunk's core, which kind of render will be used
     */
    public getType(): Toolkit.ETypedRowRenders {
        // We will use columns render.
        return Toolkit.ETypedRowRenders.columns;
    }
    /**
     * This method will be called for each row in main view and view of search results
     * @param sourceName { string } - name of source of incoming data. For example for file
     * it will be filename. For plugin - plugin name.
     * @param sourceMeta { string } - optional data, which could better describe incoming data.
     * For example for text file it will be "plain/text"; for DLT file - "dlt"
     * @returns { boolean } - in "true" custom render will be applied for row; in "false" custom
     * render will be ignored
     */
    public isTypeMatch(sourceName: string, sourceMeta?: string): boolean {
        // In this example, we are creating custom render for CSV file, to show its content
        // as columns.
        // So, let's just check file name for expected extension.
        return sourceName.search(/\.csv$/gi) !== -1;
    }
    /**
     * Caller for API of custom render. Would be called by chipmunk's core for each row, which returns
     * "true" via "isTypeMatch"
     * @returns { Class }
     */
    public getAPI(): ColumnsAPI {
        return this._api;
    }
}
</code></pre>
</div>

<div id="col_public_api.ts" class="tabcontent col">
<pre><code class="language-Javascript">/*
 * Public API Surface of terminal
 */
import { Columns } from './lib/row.columns';
const columns = new Columns();
// For Angular based plugin would be enough to make export with instance of
// render. No needs to use gateway
export { columns };
</code></pre>
</div>

## Row Parser

The plugin **Row Parser** creates a custom render for DLT files to colorize keywords.

<pre><code>&#9492;&#9472;&#9472; render
    &#9500;&#9472;&#9472; src
    &#9474;   &#9492;&#9472;&#9472; index.ts
    &#9500;&#9472;&#9472; package.json
    &#9500;&#9472;&#9472; tsconfig.json
    &#9500;&#9472;&#9472; tslint.json
    &#9492;&#9472;&#9472; webpack.config.js
</code></pre>

<div class="tab par">
  <button class="tablinks active" onclick="openCode(event, 'par_index.ts')">index.ts</button>
</div>

<div id="par_index.ts" class="tabcontent par active">
<pre><code class="language-Javascript">import * as Toolkit from 'chipmunk.client.toolkit';
import { default as AnsiUp } from 'ansi_up';
const ansiup = new AnsiUp();
ansiup.escape_for_html = false;
const REGS = {
    COLORS: /\x1b\[[\d;]{1,}[mG]/,
    COLORS_GLOBAL: /\x1b\[[\d;]{1,}[mG]/g,
};
const ignoreList: { [key: string]: boolean } = {};
// To create selection parse we should extend class from RowCommonParser class
// Our class should have at least one public methods:
// - parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo)
export class ASCIIColorsParser extends Toolkit.RowCommonParser {
    /**
     * Method with be called by chipmunk for each row in main view and search results view.
     * @param str { string } - row value as string
     * @param themeTypeRef { EThemeType } - name of current color theme
     * @param row { IRowInfo } - information about row
     * @returns { string } - parsed row as string. It can include HTML tags
     */
    public parse(str: string, themeTypeRef: Toolkit.EThemeType, row: Toolkit.IRowInfo): string {
        if (typeof row.sourceName === "string") {
            if (ignoreList[row.sourceName] === undefined) {
                ignoreList[row.sourceName] = row.sourceName.search(/\.dlt$/gi) !== -1;
            }
            if (!ignoreList[row.sourceName]) {
                if (row.hasOwnStyles) {
                    // Only strip ANSI escape-codes
                    return str.replace(REGS.COLORS_GLOBAL, "");
                } else if (REGS.COLORS.test(str)) {
                    // ANSI escape-codes to html color-styles
                    return ansiup.ansi_to_html(str);
                }
            }
        }
        return str;
    }
}
// To delivery plugin into chipmunk we should use chipmunk's gateway
// It's stored in global variable "chipmunk"
// Gateway has a method "setPluginExports". With this method we can
// define a list of exported parsers.
const gate: Toolkit.PluginServiceGate | undefined = (window as any).logviewer;
if (gate === undefined) {
    console.error(`Fail to find chipmunk gate.`);
} else {
    gate.setPluginExports({
        // Name of property (in this case it's "ascii" could be any. Chipmunk doesn't check
        // a name of property, but detecting a parent class.
        ascii: new ASCIIColorsParser(),
    });
}
</code></pre>
</div>

## Selection Parser

The plugin **Selection Parser** creates a parser that parses the selected string in the output console. The parser can be selected by right-clicking and opening the option menu. 

<pre><code>&#9492;&#9472;&#9472; render
    &#9500;&#9472;&#9472; src
    &#9474;   &#9492;&#9472;&#9472; index.ts
    &#9500;&#9472;&#9472; package.json
    &#9500;&#9472;&#9472; tsconfig.json
    &#9500;&#9472;&#9472; tslint.json
    &#9492;&#9472;&#9472; webpack.config.js
</code></pre>

<div class="tab sel">
  <button class="tablinks active" onclick="openCode(event, 'sel_index.ts')">index.ts</button>
</div>

<div id="sel_index.ts" class="tabcontent sel active">
<pre><code class="language-Javascript">import * as Toolkit from 'chipmunk.client.toolkit';
// To create selection parse we should extend class from SelectionParser class
// Our class should have at least two public methods:
// - getParserName(selection: string): string | undefined
// - parse(selection: string, themeTypeRef: Toolkit.EThemeType)
export class SelectionParser extends Toolkit.SelectionParser {
    /**
     * Method with be called by chipmunk before show context menu in main view.
     * If selection acceptable by parser, method should return name on menu item
     * in context menu of chipmunk.
     * If selection couldn't be parsered, method should return undefined. In this
     * case menu item in context menu for this parser will not be show.
     * @param selection { string } - selected text in main view of chipmunk
     * @returns { string } - name of menu item in context menu
     * @returns { undefined } - in case if menu item should not be shown in context menu
     */
    public getParserName(selection: string): string | undefined {
        const date: Date | undefined = this._getDate(selection);
        return date instanceof Date ? 'Convert to DateTime' : undefined;
    }
    /**
     * Method with be called by chipmunk if user will select menu item (see getParserName)
     * in context menu of selection in main view.
     * @param selection { string } - selected text in main view of chipmunk
     * @param themeTypeRef { EThemeType } - name of current color theme
     * @returns { string } - parsed string
     */
    public parse(selection: string, themeTypeRef: Toolkit.EThemeType): string {
        const date: Date | undefined = this._getDate(selection);
        return date !== undefined ? date.toUTCString() : '';
    }
    private _getDate(selection: string): Date | undefined {
        const num: number = parseInt(selection, 10);
        if (!isFinite(num) || isNaN(num)) {
            return undefined;
        }
        const date: Date = new Date(num);
        return date instanceof Date ? date : undefined;
    }
}
// To delivery plugin into chipmunk we should use chipmunk's gateway
// It's stored in global variable "chipmunk"
// Gateway has a method "setPluginExports". With this method we can
// define a list of exported parsers.
const gate: Toolkit.PluginServiceGate | undefined = (window as any).chipmunk;
if (gate === undefined) {
    // This situation isn't possible, but let's check it also
    console.error(`Fail to find chipmunk gate.`);
} else {
    gate.setPluginExports({
        // Name of property (in this case it's "datetime" could be any. Chipmunk doesn't check
        // a name of property, but detecting a parent class.
        datetime: new SelectionParser(),
    });
}
</code></pre>
</div>

## Shell

The plugin **Shell** creates an input in which console commands can be typed whereas the output will be directed into the output section of Chipmunk.

<pre><code>&#9500;&#9472;&#9472; process
&#9474;   &#9500;&#9472;&#9472; src
&#9474;   &#9474;   &#9500;&#9472;&#9472; env.logger.parameters.ts
&#9474;   &#9474;   &#9500;&#9472;&#9472; env.logger.ts
&#9474;   &#9474;   &#9500;&#9472;&#9472; main.ts
&#9474;   &#9474;   &#9500;&#9472;&#9472; process.env.ts
&#9474;   &#9474;   &#9500;&#9472;&#9472; process.fork.ts
&#9474;   &#9474;   &#9492;&#9472;&#9472; service.stream.ts
&#9474;   &#9500;&#9472;&#9472; package.json
&#9474;   &#9492;&#9472;&#9472; tsconfig.json
&#9492;&#9472;&#9472; render
    &#9500;&#9472;&#9472; src
    &#9474;   &#9500;&#9472;&#9472; lib
    &#9474;   &#9474;   &#9500;&#9472;&#9472; common
    &#9474;   &#9474;   &#9474;   &#9500;&#9472;&#9472; host.events.ts
    &#9474;   &#9474;   &#9474;   &#9492;&#9472;&#9472; interface.settings.ts
    &#9474;   &#9474;   &#9500;&#9472;&#9472; parsers
    &#9474;   &#9474;   &#9474;   &#9500;&#9472;&#9472; parser.rest.ts
    &#9474;   &#9474;   &#9474;   &#9492;&#9472;&#9472; parser.row.ts
    &#9474;   &#9474;   &#9500;&#9472;&#9472; tools
    &#9474;   &#9474;   &#9474;   &#9492;&#9472;&#9472; ansi.colors.ts
    &#9474;   &#9474;   &#9500;&#9472;&#9472; views
    &#9474;   &#9474;   &#9474;   &#9492;&#9472;&#9472; sidebar.vertical
    &#9474;   &#9474;   &#9474;       &#9500;&#9472;&#9472; compontent.ts
    &#9474;   &#9474;   &#9474;       &#9500;&#9472;&#9472; styles.less
    &#9474;   &#9474;   &#9474;       &#9492;&#9472;&#9472; template.html
    &#9474;   &#9474;   &#9500;&#9472;&#9472; module.ts
    &#9474;   &#9474;   &#9492;&#9472;&#9472; service.ts
    &#9474;   &#9492;&#9472;&#9472; public-api.ts
    &#9500;&#9472;&#9472; ng-package.json
    &#9500;&#9472;&#9472; package.json
    &#9500;&#9472;&#9472; tsconfig.lib.json
    &#9500;&#9472;&#9472; tsconfig.spec.json
    &#9492;&#9472;&#9472; tslint.json
</code></pre>

### Process
<div class="tab shp">
  <button class="tablinks" onclick="openCode(event, 'shp_env.logger.parameters.ts')">env.logger.parameters.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shp_env.logger.ts')">env.logger.ts</button>
  <button class="tablinks active" onclick="openCode(event, 'shp_main.ts')">main.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shp_process.env.ts')">process.env.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shp_process.fork.ts')">process.fork.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shp_service.stream.ts')">service.stream.ts</button>
</div>

<div id="shp_env.logger.parameters.ts" class="tabcontent shp">
<pre><code class="language-Javascript">const DEFAUT_ALLOWED_CONSOLE = {
    DEBUG: true,
    ENV: true,
    ERROR: true,
    INFO: true,
    VERBOS: false,
    WARNING: true,
};
export type TOutputFunc = (...args: any[]) => any;
/**
 * @class
 * Settings of logger
 *
 * @property {boolean} console - Show / not show logs in console
 * @property {Function} output - Sends ready string message as argument to output functions
 */
export class LoggerParameters {
    public console: boolean = true;
    public allowedConsole: {[key: string]: boolean} = {};
    public output: TOutputFunc | null = null;
    constructor(
        {
            console         = true,
            output          = null,
            allowedConsole  = DEFAUT_ALLOWED_CONSOLE,
        }: {
            console?: boolean,
            output?: TOutputFunc | null,
            allowedConsole?: {[key: string]: boolean },
        }) {
        this.console = console;
        this.output = output;
        this.allowedConsole = allowedConsole;
    }
}
</code></pre>
</div>

<div id="shp_env.logger.ts" class="tabcontent shp">
<pre><code class="language-Javascript">import { inspect } from 'util';
import { LoggerParameters } from './env.logger.parameters';
enum ELogLevels {
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    WARNING = 'WARNING',
    VERBOS = 'VERBOS',
    ERROR = 'ERROR',
    ENV = 'ENV',
}
export type TOutputFunc = (...args: any[]) => any;
/**
 * @class
 * Logger
 */
export default class Logger {
    private _signature: string = '';
    private _parameters: LoggerParameters = new LoggerParameters({});
    /**
     * @constructor
     * @param {string} signature        - Signature of logger instance
     * @param {LoggerParameters} params - Logger parameters
     */
    constructor(signature: string, params?: LoggerParameters) {
        params instanceof LoggerParameters && (this._parameters = params);
        this._signature = signature;
    }
    public setOutput(output: TOutputFunc) {
        if (typeof output !== 'function') {
            this.error(`Fail to setup output function, because it should function, but had gotten: ${typeof output}`);
        }
        this._parameters.output = output;
    }
    /**
     * Publish info logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public info(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.INFO);
    }
    /**
     * Publish warnings logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public warn(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.WARNING);
    }
    /**
     * Publish verbose logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public verbose(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.VERBOS);
    }
    /**
     * Publish error logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public error(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.ERROR);
    }
    /**
     * Publish debug logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public debug(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.DEBUG);
    }
    /**
     * Publish environment logs (low-level stuff, support or tools)
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public env(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.ENV);
    }
    private _console(message: string, level: ELogLevels) {
        if (!this._parameters.console) {
            return false;
        }
        /* tslint:disable */
        this._parameters.allowedConsole[level] && console.log(message);
        /* tslint:enable */
    }
    private _output(message: string) {
        if (typeof this._parameters.output === 'function') {
            this._parameters.output(message);
            return true;
        } else {
            return false;
        }
    }
    private _getMessage(...args: any[]) {
        let message = ``;
        if (args instanceof Array) {
            args.forEach((smth: any, index: number) => {
                if (typeof smth !== 'string') {
                    message = `${message} (type: ${(typeof smth)}): ${inspect(smth)}`;
                } else {
                    message = `${message}${smth}`;
                }
                index < (args.length - 1) && (message = `${message},\n `);
            });
        }
        return message;
    }
    private _getTime(): string {
        const time: Date = new Date();
        return `${time.toJSON()}`;
    }
    private _log(message: string, level: ELogLevels) {
        message = `[${this._signature}]: ${message}`;
        if (!this._output(`[${this._getTime()}]${message}`)) {
            this._console(`[${this._getTime()}]${message}`, level);
        }
        return message;
    }
}
</code></pre>
</div>

<div id="shp_main.ts" class="tabcontent shp active">
<pre><code class="language-Javascript">import Logger from './env.logger';
import * as path from 'path';
import PluginIPCService, { ServiceState } from 'chipmunk.plugin.ipc';
import { IPCMessages } from 'chipmunk.plugin.ipc';
import StreamsService, { IStreamInfo } from './service.streams';
import { IForkSettings } from './process.fork';
class Plugin {
    private _logger: Logger = new Logger('Processes');
    constructor() {
        this._onStreamOpened = this._onStreamOpened.bind(this);
        this._onStreamClosed = this._onStreamClosed.bind(this);
        this._onIncomeRenderIPCMessage = this._onIncomeRenderIPCMessage.bind(this);
        PluginIPCService.subscribe(IPCMessages.PluginInternalMessage, this._onIncomeRenderIPCMessage);
        StreamsService.on(StreamsService.Events.onStreamOpened, this._onStreamOpened);
        StreamsService.on(StreamsService.Events.onStreamClosed, this._onStreamClosed);
    }
    private _onIncomeRenderIPCMessage(message: IPCMessages.PluginInternalMessage, response: (res: IPCMessages.TMessage) => any) {
        switch (message.data.command) {
            case 'command':
                return this._income_command(message).then(() => {
                    response(new IPCMessages.PluginInternalMessage({
                        data: {
                            status: 'done'
                        },
                        token: message.token,
                        stream: message.stream
                    }));
                }).catch((error: Error) => {
                    return response(new IPCMessages.PluginError({
                        message: error.message,
                        stream: message.stream,
                        token: message.token,
                        data: {
                            command: message.data.command
                        }
                    }));
                });
            case 'stop':
                return this._income_stop(message).then(() => {
                    response(new IPCMessages.PluginInternalMessage({
                        data: {
                            status: 'done'
                        },
                        token: message.token,
                        stream: message.stream
                    }));
                }).catch((error: Error) => {
                    return response(new IPCMessages.PluginError({
                        message: error.message,
                        stream: message.stream,
                        token: message.token,
                        data: {
                            command: message.data.command
                        }
                    }));
                });
            case 'write':
                return this._income_write(message).then(() => {
                    response(new IPCMessages.PluginInternalMessage({
                        data: {
                            status: 'done'
                        },
                        token: message.token,
                        stream: message.stream
                    }));
                }).catch((error: Error) => {
                    return response(new IPCMessages.PluginError({
                        message: error.message,
                        stream: message.stream,
                        token: message.token,
                        data: {
                            command: message.data.command
                        }
                    }));
                });
            case 'getSettings':
                return this._income_getSettings(message).then((settings: IForkSettings) => {
                    response(new IPCMessages.PluginInternalMessage({
                        data: {
                            settings: settings
                        },
                        token: message.token,
                        stream: message.stream
                    }));
                }).catch((error: Error) => {
                    return response(new IPCMessages.PluginError({
                        message: error.message,
                        stream: message.stream,
                        token: message.token,
                        data: {
                            command: message.data.command
                        }
                    }));
                });
            default:
                this._logger.warn(`Unknown commad: ${message.data.command}`);
        }
    }
    private _income_command(message: IPCMessages.PluginInternalMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            const streamId: string | undefined = message.stream;
            if (streamId === undefined) {
                return reject(new Error(this._logger.warn(`No target stream ID provided`)));
            }
            // Get a target stream
            const stream: IStreamInfo | undefined = StreamsService.get(streamId);
            if (stream === undefined) {
                return reject(new Error(this._logger.warn(`Fail to find a stream "${streamId}" in storage.`)));
            }
            const cmd: string | undefined = message.data.cmd;
            if (typeof cmd !== 'string') {
                return reject(new Error(this._logger.warn(`Fail to execute command for a stream "${streamId}" because command isn't a string, but ${typeof cmd}.`)));
            }
            // Check: is it "cd" command. If yes, change cwd of settings and resolve
            const cd: boolean | Error = this._cwdChange(cmd, stream);
            if (cd === true) {
                return resolve();
            } else if (cd instanceof Error) {
                return reject(cd);
            }
            // Ref fork to stream
            StreamsService.refFork(streamId, cmd);
            resolve();            
        });
    }
    private _income_stop(message: IPCMessages.PluginInternalMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            const streamId: string | undefined = message.stream;
            if (streamId === undefined) {
                return reject(new Error(this._logger.warn(`No target stream ID provided`)));
            }
            // Get a target stream
            const stream: IStreamInfo | undefined = StreamsService.get(streamId);
            if (stream === undefined) {
                return reject(new Error(this._logger.warn(`Fail to find a stream "${streamId}" in storage.`)));
            }
            // Ref fork to stream
            StreamsService.unrefFork(streamId);
            resolve();            
        });
    }
    private _income_write(message: IPCMessages.PluginInternalMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            const streamId: string | undefined = message.stream;
            if (streamId === undefined) {
                return reject(new Error(this._logger.warn(`No target stream ID provided`)));
            }
            // Get a target stream
            const stream: IStreamInfo | undefined = StreamsService.get(streamId);
            if (stream === undefined) {
                return reject(new Error(this._logger.warn(`Fail to find a stream "${streamId}" in storage.`)));
            }
            const input: any = message.data.input;
            if (input === undefined) {
                return reject(new Error(this._logger.warn(`Fail to write into stream "${streamId}" because input is undefined.`)));
            }
            // Check: is fork still running
            if (stream.fork === undefined || stream.fork.isClosed()) {
                return reject(new Error(this._logger.warn(`Fail to write into stream "${streamId}" because fork is closed.`)));
            }
            // Write data
            stream.fork.write(input).then(resolve).catch(reject);
        });
    }
    private _income_getSettings(message: IPCMessages.PluginInternalMessage): Promise<IForkSettings> {
        return new Promise((resolve, reject) => {
            const streamId: string | undefined = message.stream;
            if (streamId === undefined) {
                return reject(new Error(this._logger.warn(`No target stream ID provided`)));
            }
            // Get a target stream
            const stream: IStreamInfo | undefined = StreamsService.get(streamId);
            if (stream === undefined) {
                return reject(new Error(this._logger.warn(`Fail to find a stream "${streamId}" in storage.`)));
            }
            resolve(stream.settings);            
        });
    }
    private _cwdChange(command: string, stream: IStreamInfo): boolean | Error {
        const cdCmdReg = /^cd\s*([^\s]*)/gi;
        const match: RegExpExecArray | null = cdCmdReg.exec(command.trim());
        if (match === null) {
            return false;
        }
        if (match.length !== 2) {
            return false;
        }
        try {
            stream.settings.cwd = path.resolve(stream.settings.cwd, match[1]);
        } catch (e) {
            this._logger.error(`Fail to make "cd" due error: ${e.message}`);
            return e;
        }
        StreamsService.updateSettings(stream.streamId, stream.settings);
        return true;
    }
    private _onStreamOpened(streamId: string) {
        // Get a target stream
        const stream: IStreamInfo | undefined = StreamsService.get(streamId);
        if (stream === undefined) {
            return this._logger.warn(`Event "onStreamOpened" was triggered, but fail to find a stream "${streamId}" in storage.`);
        }
        const error: Error | undefined = StreamsService.updateSettings(stream.streamId);
        if (error instanceof Error) {
            return this._logger.warn(`Event "onStreamOpened" was triggered, but fail to notify host due error: ${error.message}.`);
        }
    }
    private _onStreamClosed(streamId: string) {
    }
}
const app: Plugin = new Plugin();
// Notify core about plugin
ServiceState.accept().catch((err: Error) => {
    console.log(`Fail to notify core about plugin due error: ${err.message}`);
});
</code></pre>
</div>

<div id="shp_process.env.ts" class="tabcontent shp">
<pre><code class="language-Javascript">import { exec, ExecOptions } from 'child_process';
import * as OS from 'os';
import * as Path from 'path';
import * as shellEnv from 'shell-env';
export function shell(command: string, options: ExecOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        options = typeof options === 'object' ? (options !== null ? options : {}) : {};
        exec(command, options, (error: Error | null, stdout: string, stderr: string) => {
            if (error instanceof Error) {
                return reject(error);
            }
            if (stderr.trim() !== '') {
                return reject(new Error(`Finished deu error: ${stderr}`));
            }
            resolve(stdout);
        });
    });
}
export enum EPlatforms {
    aix = 'aix',
    darwin = 'darwin',
    freebsd = 'freebsd',
    linux = 'linux',
    openbsd = 'openbsd',
    sunos = 'sunos',
    win32 = 'win32',
    android = 'android',
}
export type TEnvVars = { [key: string]: string };
export function getOSEnvVars(shell: string): Promise<TEnvVars> {
    return new Promise((resolve) => {
        if (OS.platform() !== EPlatforms.darwin) {
            return resolve(Object.assign({}, process.env) as TEnvVars);
        }
        shellEnv(shell).then((env) => {
            // console.log(`Next os env variables were detected:`);
            // console.log(env);
            resolve(env);
        }).catch((error: Error) => {
            console.log('Shell-Env Error:');
            console.log(error);
            resolve(Object.assign({}, process.env) as TEnvVars);
        });
    });
}
export function defaultShell(): Promise<string> {
    return new Promise((resolve) => {
        let shellPath: string | undefined = '';
        let command: string = '';
        switch (OS.platform()) {
            case EPlatforms.aix:
            case EPlatforms.android:
            case EPlatforms.darwin:
            case EPlatforms.freebsd:
            case EPlatforms.linux:
            case EPlatforms.openbsd:
            case EPlatforms.sunos:
                shellPath = process.env.SHELL;
                command = 'echo $SHELL';
                break;
            case EPlatforms.win32:
                shellPath = process.env.COMSPEC;
                command = 'ECHO %COMSPEC%';
                break;
        }
        if (shellPath) {
            return resolve(shellPath);
        }
        // process didn't resolve shell, so we query it manually
        shell(command).then((stdout: string) => {
            resolve(stdout.trim());
        }).catch((error: Error) => {
            // COMSPEC should always be available on windows.
            // Therefore: we will try to use /bin/sh as error-mitigation
            resolve("/bin/sh");
        });
    });
}
export function shells(): Promise<string[]> {
    return new Promise((resolve) => {
        let command: string = '';
        switch (OS.platform()) {
            case EPlatforms.aix:
            case EPlatforms.android:
            case EPlatforms.darwin:
            case EPlatforms.freebsd:
            case EPlatforms.linux:
            case EPlatforms.openbsd:
            case EPlatforms.sunos:
                command = 'cat /etc/shells';
                break;
            case EPlatforms.win32:
                // TODO: Check solution with win
                command = 'cmd.com';
                break;
        }
        shell(command).then((stdout: string) => {
            const values: string[] = stdout.split(/[\n\r]/gi).filter((value: string) => {
                return value.indexOf('/') === 0;
            });
            resolve(values);
        }).catch((error: Error) => {
            resolve([]);
        });
    });
}
export function getExecutedModulePath(): string {
    return Path.normalize(`${Path.dirname(require.main === void 0 ? __dirname : require.main.filename)}`);
}
export function getHomePath(): string {
    return Path.normalize(`${OS.homedir()}`);
}
</code></pre>
</div>

<div id="shp_process.fork.ts" class="tabcontent shp">
<pre><code class="language-Javascript">import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
export interface IForkSettings {
    env: { [key: string]: string };
    shell: string | boolean;
    cwd: string;
}
export interface ICommand {
    cmd: string;
    settings: IForkSettings;
}
export default class Fork extends EventEmitter {
    public static Events = {
        data: 'data',
        exit: 'exit'
    };
    public Events = Fork.Events;
    private _process: ChildProcess | undefined;
    private _closed: boolean = true;
    private _command: ICommand;
    constructor(command: ICommand) {
        super();
        this._command = command;
    }
    public execute() {
        this._process = spawn(this._command.cmd, {
            cwd: this._command.settings.cwd,
            env: this._command.settings.env,
            shell: this._command.settings.shell,
        });
        this._closed = false;
        this._process.stdout.on('data', this._onStdout.bind(this));
        this._process.stderr.on('data', this._onStderr.bind(this));
        this._process.on('exit', this._onExit.bind(this));
        this._process.on('close', this._onClose.bind(this));
        this._process.on('disconnect', this._onDisconnect.bind(this));
        this._process.on('error', this._onError.bind(this));
    }
    public write(data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._process === undefined) {
                return reject(new Error(`Shell process isn't available. It was destroyed or wasn't created at all.`));
            }
            this._process.stdin.write(data, (error: Error | null | undefined) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }
    public destroy() {
        this._closed = true;
        if (this._process === undefined) {
            return;
        }
        this.removeAllListeners();
        this._process.removeAllListeners();
        this._process.kill();
        this._process = undefined;
    }
    public isClosed(): boolean {
        return this._closed;
    }
    private _onStdout(chunk: any) {
        this.emit(this.Events.data, chunk);
    }
    private _onStderr(chunk: any) {
        this.emit(this.Events.data, chunk);
    }
    private _onExit() {
        this.emit(this.Events.exit);
        this.destroy();
    }
    private _onClose() {
        this.emit(this.Events.exit);
        this.destroy();
    }
    private _onDisconnect() {
        this.emit(this.Events.exit);
        this.destroy();
    }
    private _onError(error: Error) {
        this.emit(this.Events.data, error.message);
        this.emit(this.Events.exit);
        this.destroy();
    }
}
</code></pre>
</div>

<div id="shp_service.stream.ts" class="tabcontent shp">
<pre><code class="language-Javascript">import Logger from './env.logger';
import PluginIPCService from 'chipmunk.plugin.ipc';
import Fork, { IForkSettings } from './process.fork';
import * as EnvModule from './process.env';
import { EventEmitter } from 'events';
import * as os from 'os';
export interface IStreamInfo {
    fork: Fork | undefined;
    streamId: string;
    settings: IForkSettings;
}
class StreamsService extends EventEmitter {
    public Events = {
        onStreamOpened: 'onStreamOpened',
        onStreamClosed: 'onStreamClosed',
    };
    private _logger: Logger = new Logger('StreamsService');
    private _streams: Map<string, IStreamInfo> = new Map();
    constructor() {
        super();
        this._onOpenStream = this._onOpenStream.bind(this);
        this._onCloseStream = this._onCloseStream.bind(this);
        PluginIPCService.on(PluginIPCService.Events.openStream, this._onOpenStream);
        PluginIPCService.on(PluginIPCService.Events.closeStream, this._onCloseStream);
    }
    public get(streamId: string): IStreamInfo | undefined {
        return this._streams.get(streamId);
    }
    public refFork(streamId: string, command: string): Error | undefined {
        const stream: IStreamInfo | undefined = this._streams.get(streamId);
        if (stream === undefined) {
            return new Error(`Stream ${streamId} is not found. Cannot set fork.`);
        }
        // Check: does fork already exist (previous commands still running)
        if (stream.fork !== undefined) {
            return new Error(`Stream ${streamId} has running fork, cannot start other.`);
        }
        // Create fork to execute command
        const fork: Fork = new Fork({ 
            cmd: command,
            settings: stream.settings
        });
        // Attach listeners
        fork.on(Fork.Events.data, (chunk) => {
            PluginIPCService.sendToStream(chunk, streamId);
        });
        fork.on(Fork.Events.exit, () => {
            this.unrefFork(streamId);
        });
        // Save fork
        stream.fork = fork;
        this._streams.set(streamId, stream);
        // Start forl
        fork.execute();
        PluginIPCService.sendToPluginHost(streamId, {
            event: 'ForkStarted',
            streamId: streamId
        });
    }
    public unrefFork(streamId: string): Error | undefined {
        const stream: IStreamInfo | undefined = this._streams.get(streamId);
        if (stream === undefined) {
            return new Error(`Stream ${streamId} is not found. Cannot set fork.`);
        }
        if (stream.fork !== undefined && !stream.fork.isClosed()) {
            stream.fork.destroy();
        }
        stream.fork = undefined;
        this._streams.set(streamId, stream);
        PluginIPCService.sendToPluginHost(streamId, {
            event: 'ForkClosed',
            streamId: streamId
        });
    }
    public updateSettings(streamId: string, settings?: IForkSettings): Error | undefined {
        const stream: IStreamInfo | undefined = this._streams.get(streamId);
        if (stream === undefined) {
            return new Error(`Stream ${streamId} is not found. Cannot update settings.`);
        }
        if (settings !== undefined) {
            stream.settings = Object.assign({}, settings);
            this._streams.set(streamId, stream);
        }
        PluginIPCService.sendToPluginHost(streamId, {
            event: 'SettingsUpdated',
            settings: stream.settings,
            streamId: streamId
        });
    }
    private _getInitialOSEnv(defaults: EnvModule.TEnvVars): EnvModule.TEnvVars {
        defaults.TERM = 'xterm-256color';
        return defaults;
    }
    private _onOpenStream(streamId: string) {
        if (this._streams.has(streamId)) {
            return this._logger.warn(`Stream ${streamId} is already created.`);
        }
        EnvModule.defaultShell().then((userShell: string) => {
            console.log(`Detected default shell: ${userShell}`);
            EnvModule.getOSEnvVars(userShell).then((env: EnvModule.TEnvVars) => {
                //Apply default terminal color scheme
                this._createStream(streamId, os.homedir(), this._getInitialOSEnv(env), userShell);
            }).catch((error: Error) => {
                this._logger.warn(`Failed to get OS env vars for stream ${streamId} due to error: ${error.message}. Default node-values will be used .`);
                this._createStream(streamId, os.homedir(), this._getInitialOSEnv(Object.assign({}, process.env) as EnvModule.TEnvVars), userShell);
            });
        }).catch((gettingShellErr: Error) => {
            this._logger.env(`Failed to create stream "${streamId}" due to error: ${gettingShellErr.message}.`)
        });
    }
    private _onCloseStream(streamId: string) {
        const stream: IStreamInfo | undefined = this._streams.get(streamId);
        if (stream === undefined) {
            return this._logger.warn(`Stream ${streamId} is already closed.`);
        }
        // Check fork before (if it's still working)
        if (stream.fork !== undefined) {
            stream.fork.destroy();
        }
        // Remove stream now
        this._streams.delete(streamId);
        this.emit(this.Events.onStreamClosed, streamId);
    }
    private _createStream(streamId: string, cwd: string, env: EnvModule.TEnvVars, shell: string) {
        this._streams.set(streamId, {
            fork: undefined,
            streamId: streamId,
            settings: {
                cwd: cwd,
                shell: shell,
                env: env
            }
        });
        this.emit(this.Events.onStreamOpened, streamId);
        this._logger.env(`Stream "${streamId}" is bound with cwd "${cwd}".`);
    }
}
export default (new StreamsService());
</code></pre>
</div>

### Render
<div class="tab shr">
  <button class="tablinks" onclick="openCode(event, 'shr_public_api.ts')">public_api.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_module.ts')">module.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_service.ts')">service.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_host.events.ts')">host.events.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_interface.settings.ts')">interface.settings.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_parser.rest.ts')">parser.rest.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_parser.row.ts')">parser.row.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_ansi.colors.ts')">ansi.colors.ts</button>
  <button class="tablinks active" onclick="openCode(event, 'shr_component.ts')">component.ts</button>
  <button class="tablinks" onclick="openCode(event, 'shr_styles.less')">styles.less</button>
  <button class="tablinks" onclick="openCode(event, 'shr_template.html')">template.html</button>
</div>

<div id="shr_public_api.ts" class="tabcontent shr">
<pre><code class="language-Javascript">/*
 * Public API Surface of terminal
 */
export * from './lib/views/sidebar.vertical/component';
export * from './lib/module';
export { parserRow } from './lib/parsers/parser.row';
export { parserRest } from './lib/parsers/parser.rest';
</code></pre>
</div>

<div id="shr_module.ts" class="tabcontent shr">
<pre><code class="language-Javascript">import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarVerticalComponent } from './views/sidebar.vertical/component';
import { PrimitiveModule } from 'chipmunk-client-material';
import * as Toolkit from 'chipmunk.client.toolkit';
@NgModule({
    entryComponents: [ SidebarVerticalComponent],
    declarations: [ SidebarVerticalComponent],
    imports: [ CommonModule, FormsModule, PrimitiveModule ],
    exports: [ SidebarVerticalComponent]
})
export class PluginModule extends Toolkit.PluginNgModule {
    constructor() {
        super('OS', 'Allows to execute local processes');
    }
}
</code></pre>
</div>

<div id="shr_service.ts" class="tabcontent shr">
<pre><code class="language-Javascript">import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  constructor() { }
}
</code></pre>
</div>

<div id="shr_host.events.ts" class="tabcontent shr">
<pre><code class="language-Javascript">export enum EHostEvents {
    ForkStarted = 'ForkStarted',
    ForkClosed = 'ForkClosed',
    SettingsUpdated = 'SettingsUpdated',
}
export enum EHostCommands {
    command = 'command',
    write = 'write',
    stop = 'stop',
    getSettings = 'getSettings',
}
</code></pre>
</div>

<div id="shr_interface.settings.ts" class="tabcontent shr">
<pre><code class="language-Javascript">export interface IForkSettings {
    env: { [key: string]: string };
    shell: string | boolean;
    cwd: string;
}
</code></pre>
</div>

<div id="shr_parser.rest.ts" class="tabcontent shr">
<pre><code class="language-Javascript">import { AnsiEscapeSequencesColors } from '../tools/ansi.colors';
export function parserRest(str: string): string {
    const colors: AnsiEscapeSequencesColors = new AnsiEscapeSequencesColors();
    return colors.getHTML(str);
}
</code></pre>
</div>

<div id="shr_parser.row.ts" class="tabcontent shr">
<pre><code class="language-Javascript">import { AnsiEscapeSequencesColors } from '../tools/ansi.colors';
export function parserRow(str: string): string {
    const colors: AnsiEscapeSequencesColors = new AnsiEscapeSequencesColors();
    return colors.getHTML(str);
}
</code></pre>
</div>

<div id="shr_ansi.colors.ts" class="tabcontent shr">
<pre><code class="language-Javascript">// tslint:disable:max-line-length
// tslint:disable:no-inferrable-types
// Base: https://en.wikipedia.org/wiki/ANSI_escape_code
const RegExps = {
    color: /\x1b\[([0-9;]*)m/gi
};
class AnsiColorDefinition {
    private _value: string;
    private readonly _map: { [key: string]: (key: string, params: string[]) => string } = {
        '0': this._fn_drop.bind(this), '1': this._fn_bold.bind(this), '2': this._fn_ubold.bind(this), '3': this._fn_italic, '4': this._fn_underline.bind(this),
        '5': this._fn_dummy.bind(this), '6': this._fn_dummy.bind(this), '7': this._fn_dummy.bind(this), '8': this._fn_dummy.bind(this), '9': this._fn_dummy.bind(this),
        '10': this._fn_dummy.bind(this), '11': this._fn_dummy.bind(this), '12': this._fn_dummy.bind(this), '13': this._fn_dummy.bind(this), '14': this._fn_dummy.bind(this),
        '15': this._fn_dummy.bind(this), '16': this._fn_dummy.bind(this), '17': this._fn_dummy.bind(this), '18': this._fn_dummy.bind(this), '19': this._fn_dummy.bind(this),
        '20': this._fn_dummy.bind(this), '21': this._fn_dummy.bind(this), '22': this._fn_dummy.bind(this), '23': this._fn_nounderline.bind(this), '24': this._fn_nounderline.bind(this),
        '25': this._fn_dummy.bind(this), '26': this._fn_dummy.bind(this), '27': this._fn_dummy.bind(this), '28': this._fn_dummy.bind(this), '29': this._fn_dummy.bind(this),
        '30': this._fn_foreground.bind(this), '31': this._fn_foreground.bind(this), '32': this._fn_foreground.bind(this), '33': this._fn_foreground.bind(this), '34': this._fn_foreground.bind(this),
        '35': this._fn_foreground.bind(this), '36': this._fn_foreground.bind(this), '37': this._fn_foreground.bind(this), '38': this._fn_foreground.bind(this), '39': this._fn_foreground.bind(this),
        '40': this._fn_background.bind(this), '41': this._fn_background.bind(this), '42': this._fn_background.bind(this), '43': this._fn_background.bind(this), '44': this._fn_background.bind(this),
        '45': this._fn_background.bind(this), '46': this._fn_background.bind(this), '47': this._fn_background.bind(this), '48': this._fn_background.bind(this), '49': this._fn_background.bind(this),
        '50': this._fn_dummy.bind(this), '51': this._fn_dummy.bind(this), '52': this._fn_dummy.bind(this), '53': this._fn_dummy.bind(this), '54': this._fn_dummy.bind(this),
        '55': this._fn_dummy.bind(this), '56': this._fn_dummy.bind(this), '57': this._fn_dummy.bind(this), '58': this._fn_dummy.bind(this), '59': this._fn_dummy.bind(this),
        '60': this._fn_dummy.bind(this), '61': this._fn_dummy.bind(this), '62': this._fn_dummy.bind(this), '63': this._fn_dummy.bind(this), '64': this._fn_dummy.bind(this),
        '65': this._fn_dummy.bind(this),
    };
    private readonly _mapLength: { [key: string]: number } = {
        '0': 0, '1': 0, '2': 0, '3': 0, '4': 0,
        '5': 0, '6': 0, '7': 0, '8': 0, '9': 0,
        '10': 0, '11': 0, '12': 0, '13': 0, '14': 0,
        '15': 0, '16': 0, '17': 0, '18': 0, '19': 0,
        '20': 0, '21': 0, '22': 0, '23': 0, '24': 0,
        '25': 0, '26': 0, '27': 0, '28': 0, '29': 0,
        '30': 0, '31': 0, '32': 0, '33': 0, '34': 0,
        '35': 0, '36': 0, '37': 0, '38': 0, '39': 0,
        '40': 0, '41': 0, '42': 0, '43': 0, '44': 0,
        '45': 0, '46': 0, '47': 0, '48': 0, '49': 0,
        '50': 0, '51': 0, '52': 0, '53': 0, '54': 0,
        '55': 0, '56': 0, '57': 0, '58': 0, '59': 0,
        '60': 0, '61': 0, '62': 0, '63': 0, '64': 0,
        '65': 0,
    };
    constructor(value: string) {
        this._value = value;
    }
    public getStyle(): string {
        const parts: string[] = this._value.split(';');
        let styles: string = '';
        do {
            const key: string = parts[0];
            if (!this._isKeyValid(key)) {
                // Here is should be some log message, because key is unknown
                parts.splice(0, 1);
            } else {
                // Remove current key
                parts.splice(0, 1);
                // Get styles
                styles += this._map[key](key, parts);
            }
        } while (parts.length > 0);
        return styles;
    }
    private _isKeyValid(key: string): boolean {
        return this._mapLength[key] !== undefined;
    }
    private _decode8BitAnsiColor(ansi: number): string {
        // https://gist.github.com/MightyPork/1d9bd3a3fd4eb1a661011560f6921b5b
        const low_rgb = [
            '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
            '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
        ];
        if (ansi < 0 || ansi > 255)  { return '#000'; }
        if (ansi < 16) { return low_rgb[ansi]; }
        if (ansi > 231) {
          const s = (ansi - 232) * 10 + 8;
          return `rgb(${s},${s},${s})`;
        }
        const n = ansi - 16;
        let b = n % 6;
        let g = (n - b) / 6 % 6;
        let r = (n - b - g * 6) / 36 % 6;
        b = b ? b * 40 + 55 : 0;
        r = r ? r * 40 + 55 : 0;
        g = g ? g * 40 + 55 : 0;
        return `rgb(${r},${g},${b})`;
    }
    private _fn_bold(key: string, params: string[]): string {
        return 'fontWeight: bold;';
    }
    private _fn_ubold(key: string, params: string[]): string {
        return 'fontWeight: normal;';
    }
    private _fn_italic(key: string, params: string[]): string {
        return 'fontStyle: italic;';
    }
    private _fn_underline(key: string, params: string[]): string {
        return 'textDecoration: underline;';
    }
    private _fn_nounderline(key: string, params: string[]): string {
        return 'textDecoration: none;';
    }
    private _fn_foreground(key: string, params: string[]): string {
        switch (key) {
            case '30':
                return 'color: rgb(0,0,0);';
            case '31':
                return 'color: rgb(170,0,0);';
            case '32':
                return 'color: rgb(0,170,0);';
            case '33':
                return 'color: rgb(170,85,0);';
            case '34':
                return 'color: rgb(0,0,170);';
            case '35':
                return 'color: rgb(170,0,170);';
            case '36':
                return 'color: rgb(0,170,170);';
            case '37':
                return 'color: rgb(170,170,170);';
            case '38':
                if (params[0] === '5' && params.length >= 2) {
                    const cut = params.splice(0, 2);
                    return `color: ${this._decode8BitAnsiColor(parseInt(cut[1], 10))};`;
                } else if (params[0] === '2' && params.length >= 4) {
                    const cut = params.splice(0, 4);
                    return `color: rgb(${cut[1]}, ${cut[2]}, ${cut[3]});`;
                } else {
                    return '';
                }
            case '39':
                return 'color: inherit;';
            default:
                return '';
        }
    }
    private _fn_background(key: string, params: string[]): string {
        switch (key) {
            case '40':
                return 'backgroundColor: rgb(0,0,0);';
            case '41':
                return 'backgroundColor: rgb(128,0,0);';
            case '42':
                return 'backgroundColor: rgb(0,128,0);';
            case '43':
                return 'backgroundColor: rgb(128,128,0);';
            case '44':
                return 'backgroundColor: rgb(0,0,128);';
            case '45':
                return 'backgroundColor: rgb(128,0,128);';
            case '46':
                return 'backgroundColor: rgb(0,128,128);';
            case '47':
                return 'backgroundColor: rgb(192,192,192);';
            case '48':
                if (params[0] === '5' && params.length >= 2) {
                    const cut = params.splice(0, 2);
                    return `backgroundColor: ${this._decode8BitAnsiColor(parseInt(cut[1], 10))};`;
                } else if (params[0] === '2' && params.length >= 4) {
                    const cut = params.splice(0, 4);
                    return `backgroundColor: rgb(${cut[1]}, ${cut[2]}, ${cut[3]});`;
                } else {
                    return '';
                }
            case '49':
                return 'backgroundColor: inherit;';
            default:
                return '';
        }
    }
    private _fn_drop(key: string, params: string[]): string {
        return '';
    }
    private _fn_dummy(key: string, params: string[]): string {
        return '';
    }
}
export class AnsiEscapeSequencesColors {
    constructor() {
    }
    public getHTML(input: string): string {
        let opened: number = 0;
        input = input.replace(RegExps.color, (substring: string, match: string, offset: number, whole: string) => {
            const styleDef: AnsiColorDefinition = new AnsiColorDefinition(match);
            const style: string = styleDef.getStyle();
            opened ++;
            return style !== '' ? `<span style="${style}">` : `<span>`;
        });
        input += `</span>`.repeat(opened);
        input = input.replace(/<span><\/span>/gi, '');
        return input;
    }
}
</code></pre>
</div>

<div id="shr_component.ts" class="tabcontent shr active">
<pre><code class="language-Javascript">// tslint:disable:no-inferrable-types
import { Component, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';
import { EHostEvents, EHostCommands } from '../../common/host.events';
import { IForkSettings } from '../../common/interface.settings';
import * as Toolkit from 'chipmunk.client.toolkit';
export interface IEnvVar {
    key: string;
    value: string;
}
interface IState {
    _ng_envvars: IEnvVar[];
    _ng_settings: IForkSettings | undefined;
    _ng_working: boolean;
    _ng_cmd: string;
}
const state: Toolkit.ControllerState<IState> = new Toolkit.ControllerState<IState>();
@Component({
    selector: 'lib-sidebar-ver',
    templateUrl: './template.html',
    styleUrls: ['./styles.less']
})
export class SidebarVerticalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('cmdinput', {static: false}) _ng_input: ElementRef;
    @Input() public api: Toolkit.IAPI;
    @Input() public session: string;
    @Input() public sessions: Toolkit.ControllerSessionsEvents;
    public _ng_envvars: IEnvVar[] = [];
    public _ng_settings: IForkSettings | undefined;
    public _ng_working: boolean = false;
    public _ng_cmd: string = '';
    private _subscriptions: { [key: string]: Toolkit.Subscription } = {};
    private _logger: Toolkit.Logger = new Toolkit.Logger(`Plugin: processes: inj_output_bot:`);
    private _destroyed: boolean = false;
    constructor(private _cdRef: ChangeDetectorRef) {
    }
    ngOnDestroy() {
        this._destroyed = true;
        this._saveState();
        Object.keys(this._subscriptions).forEach((key: string) => {
            this._subscriptions[key].unsubscribe();
        });
    }
    ngAfterViewInit() {
        // Subscription to income events
        this._subscriptions.incomeIPCHostMessage = this.api.getIPC().subscribe((message: any) => {
            if (typeof message !== 'object' && message === null) {
                // Unexpected format of message
                return;
            }
            if (message.streamId !== this.session) {
                // No definition of streamId
                return;
            }
            this._onIncomeMessage(message);
        });
        // Subscribe to sessions events
        this._subscriptions.onSessionChange = this.sessions.subscribe().onSessionChange(this._onSessionChange.bind(this));
        this._subscriptions.onSessionOpen = this.sessions.subscribe().onSessionOpen(this._onSessionOpen.bind(this));
        this._subscriptions.onSessionClose = this.sessions.subscribe().onSessionClose(this._onSessionClose.bind(this));
        // Restore state
        this._loadState();
    }
    public _ng_onKeyUp(event: KeyboardEvent) {
        if (this._ng_working) {
            this._sendInput(event);
        } else {
            this._sendCommand(event);
        }
    }
    public _ng_onStop(event: MouseEvent) {
        this._sendStop();
    }
    private _sendCommand(event: KeyboardEvent) {
        if (event.key !== 'Enter') {
            return;
        }
        if (this._ng_cmd.trim() === '') {
            return;
        }
        this.api.getIPC().request({
            stream: this.session,
            command: EHostCommands.command,
            cmd: this._ng_cmd,
            shell: this._ng_settings.shell,
        }, this.session).catch((error: Error) => {
            console.error(error);
        });
    }
    private _sendStop() {
        if (!this._ng_working) {
            return;
        }
        this.api.getIPC().request({
            stream: this.session,
            command: EHostCommands.stop,
        }, this.session).catch((error: Error) => {
            console.error(error);
        });
    }
    private _sendInput(event: KeyboardEvent) {
        this.api.getIPC().request({
            stream: this.session,
            command: EHostCommands.write,
            input: event.key
        }, this.session).catch((error: Error) => {
            console.error(error);
        });
        this._ng_cmd = '';
    }
    private _onIncomeMessage(message: any) {
        if (typeof message.event === 'string') {
            // Process events
            return this._onIncomeEvent(message);
        }
    }
    private _onIncomeEvent(message: any) {
        switch (message.event) {
            case EHostEvents.ForkStarted:
                this._ng_working = true;
                break;
            case EHostEvents.ForkClosed:
                this._ng_working = false;
                this._ng_cmd = '';
                break;
            case EHostEvents.SettingsUpdated:
                this._ng_settings = message.settings;
                this._settingsUpdated();
                break;
        }
        this._forceUpdate();
    }
    private _settingsUpdated(settings?: IForkSettings) {
        if (settings !== undefined) {
            this._ng_settings = settings;
        }
        if (this._ng_settings === undefined) {
            return;
        }
        this._ng_envvars = [];
        Object.keys(this._ng_settings.env).forEach((key: string) => {
            this._ng_envvars.push({
                key: key,
                value: this._ng_settings.env[key]
            });
        });
        this._forceUpdate();
    }
    private _onSessionChange(guid: string) {
        this._saveState();
        this.session = guid;
        this._loadState();
    }
    private _onSessionOpen(guid: string) {
        //
    }
    private _onSessionClose(guid: string) {
        //
    }
    private _saveState() {
        if (this._ng_envvars.length === 0) {
            // Do not save, because data wasn't gotten from backend
            return;
        }
        state.save(this.session, {
            _ng_envvars: this._ng_envvars,
            _ng_settings: this._ng_settings,
            _ng_working: this._ng_working,
            _ng_cmd: this._ng_cmd === undefined ? '' : this._ng_cmd,
        });
    }
    private _loadState() {
        this._ng_envvars  = [];
        this._ng_settings = undefined;
        this._ng_working = false;
        this._ng_cmd = '';
        const stored: IState | undefined = state.load(this.session);
        if (stored === undefined) {
            this._initState();
        } else {
            Object.keys(stored).forEach((key: string) => {
                (this as any)[key] = stored[key];
            });
        }
        if (this._ng_input !== null && this._ng_input !== undefined) {
            this._ng_input.nativeElement.value = this._ng_cmd;
        }
        this._forceUpdate();
    }
    private _initState() {
        // Request current settings
        this.api.getIPC().request({
            stream: this.session,
            command: EHostCommands.getSettings,
        }, this.session).then((response) => {
            this._settingsUpdated(response.settings);
        });
        // Request current cwd
        this.api.getIPC().request({
            stream: this.session,
            command: EHostCommands.getSettings,
        }, this.session).then((response) => {
            this._forceUpdate();
        }).catch((error: Error) => {
            this._logger.env(`Cannot get current setting. It could be stream just not created yet. Error message: ${error.message}`);
        });
    }
    private _forceUpdate() {
        if (this._destroyed) {
            return;
        }
        this._cdRef.detectChanges();
    }
}
</code></pre>
</div>

<div id="shr_styles.less" class="tabcontent shr">
<pre><code class="language-CSS">
@import '../../../../../../theme/variables.less';
:host {
    position: absolute;
    display: block;
    top:0.5rem;
    left:0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;
    overflow-x: hidden;
    overflow-y: auto;
    & * {
        color: @scheme-color-0;
    }
    & div.wrapper{
        position: relative;
        display: block;
        width: 100%;
        & ul.env-vars{
            position: relative;
            display: block;
            padding: 0;
            margin: 0;
            list-style: none;
            max-height: 15rem;
            overflow-x: hidden;
            overflow-y: auto;
            & li{
                position: relative;
                display: block;
                padding: 0;
                margin: 0;
                list-style: none;
                height: 1rem;
                white-space: nowrap;
                border-bottom: thin dotted grey;
                & * {
                    display: inline-block;
                    vertical-align: top;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                & span.key{
                    width: 30%;
                }
                & span.value{
                    width: 70%;
                }
            }
        }
        & p.crop{
            font-size: 0.8rem;
            line-height: 0.8rem;
            font-family: 'console', monospace;
            height: 1rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: pre;
        }
    }
    & .container{
        position: relative;
        display: block;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        & div.input-wrapper {
            position: relative;
            display: block;
            height: 1.5rem;
            width: ~"calc(100% + 1rem)";
            margin-left: -0.5rem;
        }
        &.working{
            & div.input-wrapper {
                position: relative;
                display: block;
                height: 1.5rem;
                width: ~"calc(100% - 5.5rem)";
                margin-left: 2.5rem;
            }
            & .input-area{
                width: auto;
                margin-right: 2.5rem;
            }
        }
        & div.spinner{
            position: absolute;
            left: 0.25rem;
            top: 0.25rem;
            width: 2rem;
            height: 1rem;
        }
        & div.buttons{
            position: absolute;
            right: 0;
            top: -0.35rem;
            height: 100%;
            width: 3rem;
        }
    }
}
</code></pre>
</div>

<div id="shr_template.html" class="tabcontent shr">
<pre><code class="language-HTML">&lt;div class="wrapper" *ngIf="_ng_settings !== undefined"&gt;
    &lt;p class="t-normal"&gt;Environment vars&lt;/p&gt;
    &lt;ul class="env-vars"&gt;
        &lt;li *ngFor="let envvar of _ng_envvars"&gt;
            &lt;span class="key t-console"&gt;{{envvar.key}}&lt;/span&gt;
            &lt;span class="value t-console"&gt;{{envvar.value}}&lt;/span&gt;
        &lt;/li&gt;
    &lt;/ul&gt;
    &lt;p class="t-normal"&gt;Shell&lt;/p&gt;
    &lt;p class="t-console crop"&gt;{{_ng_settings.shell}}&lt;/p&gt;
    &lt;p class="t-normal"&gt;Cwd&lt;/p&gt;
    &lt;p class="t-console crop"&gt;{{_ng_settings.cwd}}&lt;/p&gt;
&lt;/div&gt;
&lt;div [attr.class]="'container ' + (_ng_working ? 'working' : 'free')"&gt;
    &lt;div class="comstyle-input-holder input-wrapper"&gt;
        &lt;div class="comstyle-input"&gt;
            &lt;input #cmdinput
                class="comstyle-input"
                [attr.disabled]="_ng_working ? '' : null"
                type="text"
                placeholder="command or path to program to be executed"
                [(ngModel)]="_ng_cmd" 
                (keyup)="_ng_onKeyUp($event)"/&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="buttons" *ngIf="_ng_working"&gt;
        &lt;span class="small-button" (click)="_ng_onStop($event)"&gt;Stop&lt;/span&gt;
    &lt;/div&gt;
    &lt;div class="spinner" *ngIf="_ng_working"&gt;
        &lt;lib-primitive-spinner-regular&gt;&lt;/lib-primitive-spinner-regular&gt;
    &lt;/div&gt;
&lt;/div&gt;
</code></pre>
</div>

# Additional features

In this part a few additional features will be explained with an example as well as a line by line description of the example code.

## Popup

A popup is a window that appears on the most upper layer of Chipmunk and blocks any kind of interaction outside of the popup until closed. It can be closed by either clicking the 'x' button on the upper right
To create and remove popups, the <a href="05_api.html#api">`API`</a> is required. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the **UI** is named `chipmunk.client.toollkit`.

### Example

In this example, a plugin with a button will be created. When the button is pressed, a popup with a message (provided by the plugin) will be shown along with a button to close the popup window.

**Popup component**

<div class="tab popup">
  <button class="tablinks" onclick="openCode(event, 'popup_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'popup_styles.less')">styles.less</button>
  <button class="tablinks active" onclick="openCode(event, 'popup_component.ts')">component.ts</button>
</div>

<div id="popup_template.html" class="tabcontent popup">
<pre><code class="language-HTML">&lt;p&gt;{{msg}}&lt;/p&gt;  &lt;!-- Show message from component --&gt;
</code></pre>
</div>

<div id="popup_styles.less" class="tabcontent popup">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="popup_component.ts" class="tabcontent popup active">
<pre><code class="language-Javascript">import { Component, Input } from '@angular/core';   // Import necessary components for popup
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

<div class="tab ppopup">
  <button class="tablinks" onclick="openCode(event, 'ppopup_plugin_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'ppopup_plugin_styles.less')">styles.less</button>
  <button class="tablinks active" onclick="openCode(event, 'ppopup_plugin_component.ts')">component.ts</button>
</div>

<div id="ppopup_plugin_template.html" class="tabcontent ppopup">
<pre><code class="language-HTML">&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_popup()&quot;&gt;&lt;/button&gt;   &lt;!-- Button to open popup --&gt;
</code></pre>
</div>

<div id="ppopup_plugin_styles.less" class="tabcontent ppopup">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="ppopup_plugin_component.ts" class="tabcontent ppopup active">
<pre><code class="language-Javascript">import { Component, Input } from '@angular/core';       // Import necessary components for plugin
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

To create notifications, the <a href="05_api.html#api">`API`</a> is required. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the **UI** is named `chipmunk.client.toollkit`.

### Example

The following example shows an example plugin with a line of text and a button which creates a notification.

<div class="tab not">
  <button class="tablinks" onclick="openCode(event, 'not_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'not_styles.less')">styles.less</button>
  <button class="tablinks active" onclick="openCode(event, 'not_component.ts')">component.ts</button>
</div>

<div id="not_template.html" class="tabcontent not">
<pre><code class="language-HTML">&lt;p&gt;Example&lt;/p&gt;
&lt;button (click)=&quot;_ng_notify()&quot;&gt;&lt;/button&gt;   &lt;!-- Create a button with a method to be called from the components.ts file --&gt;
</code></pre>
</div>

<div id="not_styles.less" class="tabcontent not">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
button {
    height: 20px;
    width: 50px;
}
</code></pre>
</div>

<div id="not_component.ts" class="tabcontent not active">
<pre><code class="language-Javascript">import { Component } from '@angular/core';
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

## Logger

To use the logger, the <a href="05_api.html#api">`API`</a> is required. **Chipmunk** provides an <a href="05_api.html#api">`API`</a> which gives access to major core events and different modules. The <a href="05_api.html#api">`API`</a> for the **UI** is named `chipmunk.client.toollkit`.

### Example

In the example below a plugin is created which logs a message as soon as the plugin is created.

<div class="tab log">
  <button class="tablinks" onclick="openCode(event, 'log_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'log_styles.less')">styles.less</button>
  <button class="tablinks active" onclick="openCode(event, 'log_component.ts')">component.ts</button>
</div>

<div id="log_template.html" class="tabcontent log">
<pre><code class="language-HTML">&lt;p&gt;Example&lt;/p&gt;     &lt;!-- Create a line of text --&gt;
</code></pre>
</div>

<div id="log_styles.less" class="tabcontent log">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="log_component.ts" class="tabcontent log active">
<pre><code class="language-Javascript">import { Component } from '@angular/core';
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

<h1> Developer mode and Breakpoints </h1>

The developer mode can be very helpful at developing (especially for the development in the **UI**). To enable the developing mode, type the following command in the command line, in which the application is started:

`export CHIPMUNK_DEVELOPING_MODE=ON`

The developer mode will create a debugger console with which console outputs made in the **UI** can be seen.

Another feature which the debugger provides is creating breakpoints as well as the ability to select HTML elements which then will be highlighted in the code along with its attributes. 

To create **breakpoints**, type the keyword `debugger` in the line the breakpoint should activate.

### Example

In the example below a plugin is created which has a breakpoint in the constructor, so the application stops as soon as the application is created.

<div class="tab dev">
  <button class="tablinks" onclick="openCode(event, 'dev_template.html')">template.html</button>
  <button class="tablinks" onclick="openCode(event, 'dev_styles.less')">styles.less</button>
  <button class="tablinks active" onclick="openCode(event, 'dev_component.ts')">component.ts</button>
</div>

<div id="dev_template.html" class="tabcontent dev">
<pre><code class="language-HTML">&lt;p&gt;Example&lt;/p&gt;
</code></pre>
</div>

<div id="dev_styles.less" class="tabcontent dev">
<pre><code class="language-CSS">p {
    color: #FFFFFF;
}
</code></pre>
</div>

<div id="dev_component.ts" class="tabcontent dev active">
<pre><code class="language-Javascript">import { Component } from '@angular/core';
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
