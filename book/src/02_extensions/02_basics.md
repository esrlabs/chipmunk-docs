## Rake commands

Rake commands are vital for the compilation of **Chipmunk**, which is why in this section the most important rake commands are going to be mentioned and described.

``` ruby
rake full_pipeline                  # Build the whole application                
rake clobber                        # Clean up the whole application
rake install_plugins_complex        # Install complex plugins 
rake install_plugins_standalone     # Install standalone plugins
rake install_plugins_angular        # Install angular plugins
```

If a new update of **Chipmunk** is available, first run `rake clobber` and `rake full_pipeline` after, to update **Chipmunk**.

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