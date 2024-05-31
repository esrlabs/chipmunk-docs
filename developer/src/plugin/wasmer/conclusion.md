# Conclusion

With the given approach plugins can be integrated easily into the host application:

```rust,no_run
        let source_plugin_factory = SourcePluginFactory::new();
        let source_plugin = source_plugin_factory.create(0).unwrap();
        let source = ByteSourceProxy::new(source_plugin, ...);

        let dlt_plugin_factory = DltPluginFactory::new();
        let dlt_plugin = dlt_plugin_factory.create(1).unwrap();
        let dlt_parser = DltParserProxy::new(dlt_plugin, ...);

        let mut dlt_msg_producer = MessageProducer::new(dlt_parser, source, ...);
```

Though, some difficulties with the current one-step processing logic of Chipmunk in contrast to performance saving bulk operations between the host and plugins have to be considered.

Given the acceptable performance impact of this low-level WebAssembly approach using memory-copy, it could serve as a first integration step towards a plugin support for Chipmunk, however.