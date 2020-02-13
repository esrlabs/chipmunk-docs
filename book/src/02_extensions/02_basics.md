## Rake commands

Rake commands are vital for the compilation of **Chipmunk**, which is why in this section the most important rake commands are going to be mentioned and described.

```
rake start                          # Start application
rake dev                            # Install all plugins to application
rake dev:<pluginName>_render        # Install <pluginName> to application
rake install_plugins_complex        # Install complex plugins 
rake install_plugins_standalone     # Install standalone plugins
rake install_plugins_angular        # Install angular plugins
```

To build the back-end of the application, change to the directory `sandbox/<pluginName>/process` and run:
`npm run build`


If a new update of **Chipmunk** is available, first run `rake clobber` (to remove all compiled files) and then `rake full_pipeline`, to update re-build **Chipmunk**.

## Add plugin to sidebar

For the developed plugin to appear on the sidebar as an option, it will be necessary to add the name of the plugin in:

`application\client.core\src\app\environment\services\service.sessions.tabs.ts`

In the method `public add(): Promise<string>` add the name of the plugin into the array `transports: ['processes', 'serial', 'dlt-render']`

## Git commit

Commits that are being made need to be in following shape:
```
[#xxx](type) message

#xxx        Issue number
type        Commit type
            feat     - new code / feature(s)
            clean    - cleanup of code
            refact   - refactoring of existing code
            fix      - fix for bug
message     Commit message
```