# Source

* Current implementation covers the read part of the Byte-Source only, having the plugin to provide the method `read()` returning an array of bytes only.
* Acting as a wrapper, the host implements the read trait and is provided as an argument to the native `BinaryByteSource` Struct.
* With this simple approach it's possible to achieve a near-native performance with the plugin being only 2% slower than native. This is primarily due to all buffering being handled within the native part.

## WIT File

```wit, ignore
interface sourcing {
  // *** Data Types ***
  variant source-error {...}
}

interface source-client {
  use sourcing.{source-error};

  // Client trait definition 
  resource byte-source{
    constructor();
    init: func(config-path: string, file-path: string) -> result<_, source-error>;
    read: func(len: u64) -> result<list<u8>, source-error>;
  }
}

// State that the plugin must provide source implementation in this world.
world source {
  export source-client;
}
```

