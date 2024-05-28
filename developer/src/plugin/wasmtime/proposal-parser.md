# Parser

* Data types for transfer are define in `parsing` interface within the `wit` file, alongside functions provided by the host to retrieve parse results.
* The resource `parser` is encapsulated within `parse-client` interface, providing methods for creation, configuration provisioning, and parse invocation.
* The host serves as a wrapper over the plugin, implementing the parser trait to integrate with the host while abstracting plugin details
* Parse calls process the entire given bytes buffer, returning a list of parse results, which will be cached on the host for internal system integration.
* Changing the parser signature to return an iterator of results would improve the code. 
* DLT-Parser as plugin provided performance that is about 1.35x compared to the native (plugin is 33% slower than native). File size: 500 MB, native: 10.3 Seconds, Plugin: 13.6 seconds.
* An alternative parser is implemented that keeps track on the current memory state so avoid unnecessary data copying, providing one result per call. However, it had worse performance due to the overhead of repeated plugin function calls on each `parse()` call. 

## WIT file:
```wit, ignore

interface parsing {
  // *** Data types ***
  record parse-return {
    value: option<parse-yield>,
    cursor: u64,
  }

  record attachment {...}

  variant parse-yield {
    message(string),
    attachment(attachment),
    message-and-attachment(tuple<string, attachment>),
  }

  variant error {...}

  // Host functions that can be called from the plugin to provide the result
  add: func(item: result<parse-return, error>);
  add-range: func(items: list<result<parse-return, error>>);
}

interface parse-client {
  use parsing.{error, parse-return};

  // Parser trait definitions
  resource parser {
    // Create and initialize the plugin, giving it the path for its configurations
    constructor();
    init: func(config-path: stirng) -> result<_,error>;

    // *** Parse functions *** 
    // Returns all the results as list to the host without using host methods
    parse: func(data: list<u8>, timestamp: option<u64>) -> list<result<parse-return, error>>;

    // Use host methods to return the results (Save memory allocation for results list on plugin)
    parse-res: func(data: list<u8>, timestamp: option<u64>);
  }
}

// State that the plugin must provide parser implementation in this world.
world parse {
  export parse-client;
}

```

