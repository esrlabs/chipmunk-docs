<link rel="stylesheet" type="text/css" href="../styles/styles.extension.css">

<h2>Rake commands</h2>

Rake commands are vital for the compilation of **Chipmunk**, which is why in this section the most important rake commands are going to be mentioned and described.

<pre><code>
rake dev                            # Build electron application including all plugins and native code parts
rake start                          # Start Chipmunk
rake dev:pluginName_render          # Install 'pluginName' to application

# NOTE: Complex plugins are not available for the time being! #
rake install_plugins_complex        # Install all complex plugins
                                    # Complex plugins are plugins that consist of a UI and a back-end implementation
                                    # The UI represents the user-interface of the plugin whereas the back-end provides information and functionality from external sources (e.g analyzing the stream of a serial connection, for which an external library is used to connect to the serial device)
rake install_plugins_standalone     # Install all standalone plugins
                                    # Standalone plugins exist in the UI part of Chipmunk and provide functions to parse the output stream (e.g. coloring specific terms)
rake install_plugins_angular        # Install all angular plugins
                                    # Angular plugins exist in the UI part of Chipmunk
</code></pre>

<!-- To build the back-end of a plugin, change to the directory of the plugin that will be built (in this example <pluginName>) `sandbox/pluginName/process` and run:
`npm run build` -->


If a new update of **Chipmunk** is available, first run `rake clobber` (to remove all compiled files) and then `rake dev`, to update and re-build **Chipmunk**.

<h2>Add plugin to sidebar</h2>

For the developed plugin to appear on the sidebar as an option, it will be necessary to add the name of the plugin in:

`application/client.core/src/app/environment/services/service.sessions.tabs.ts`

In the method `public add(): Promise<string>` add the name of the plugin into the array `transports: ['processes', 'serial', 'dlt-render']`

<h2>Git commit</h2>

Commits that are being made need to be in following shape:
<pre><code>
[#xxx](type) message

#xxx        Issue number
type        Commit type
            feat     - new code / feature(s)
            clean    - cleanup of code
            refact   - refactoring of existing code
            fix      - fix for bug
message     Commit message
</code></pre>