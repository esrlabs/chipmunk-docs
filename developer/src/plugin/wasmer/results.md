# Results of the Plugin Prototype

Flamegraph of Source and Parser plugin in a command-line Chipmunk `export raw` test with a sample input file from `indexer_cli/test/dlt/test.dlt` (4.6 MB containing 30525 DLT messages):

[![Flamegraph of Source and Parser plugin](flamegraph.png)](flamegraph.svg?x=731&y=885)

```
session % sudo CARGO_PROFILE_RELEASE_DEBUG=true cargo flamegraph --root --release --unit-test -- tests::test_topologize_skeleton --test --nocapture --ignored run_src_and_dlt_plugin
...
running 1 test
host : new byte-source proxy<0>
proxy<0> : init source: temp.dlt
host : new dlt-parser proxy<1>
proxy<1> : init parser
proxy<0> : reload eof
host : proxy<0> stats : c-cns 30533, c-rld 18, r-ok 17, r-eof 1, r-err 0
host : proxy<1> stats : c-fn 30533, c-plg 17, p-res 30533, m-ok 30525, m-flt 0, p-inc 0, p-eof 0, p-err 8
test plugin::tests::run_src_and_dlt_plugin ... ok
```

* Source Plugin (`proxy<0>`) mirroring loaded data chunks to host:
    * c-cns: Total calls to proxy `consume` (30533 times)
    * c-rld: Actual bulk calls to plugin `reload` (18 times)
    * r-ok: Portion of `Ok` responses from plugin (17 times)
    * r-eof: Portion of `EOF` responses from plugin (1 times)
    * r-err: Portion of `Error` responses from plugin (0 times)
* Parser Plugin (`proxy<1>`) performing bulk parsing of data chunks:
    * c-fn: Total calls to proxy `parse` (30533 times)
    * c-plg: Actual bulk calls to plugin `parse` (17 times)
    * p-res: Total responses from proxy (30533 times)
    * m-ok: Portion of `Ok` responses from proxy with DLT message (30525 times)
    * m-flt: Portion of `Filtered` responses from proxy (0 times)
    * p-inc: Portion of `Incomplete` responses from proxy ( 0 times)
    * p-eof: Portion of `EOF` responses from proxy (0 times)
    * p-err: Portion of (expected) `Error` responses from proxy (8 times)
* Performance measurement of the `MessageProducer` with:
    * Native Source and Parser : 101.2ms
    * Native Source and Parser plugin : 131.2ms (ca. 129.6%)
    * Source plugin and Parser plugin : 151.1ms (ca. 149,3%)

## Final performance evaluation

On the actual Chipmunk application a larger input file of 400 MB and approx 1.9 Million contained DLT messages was used within an `Import DLT-File` session with:

```
host : new byte-source proxy<0>
host : new dlt-parser proxy<1>
...
host : proxy<0> stats : c-cns 1917847, c-rld 1556, r-ok 1555, r-eof 1, r-err 0
host : proxy<1> stats : c-fn 1917847, c-plg 1555, p-res 1917847, m-ok 1917072, m-flt 0, p-inc 0, p-eof 0, p-err 775
```

* Native Source and Parser : 15s
* Native Source and Parser plugin : 20s (ca. 133%)
* Source plugin and Parser plugin : 22s (ca. 147%)
