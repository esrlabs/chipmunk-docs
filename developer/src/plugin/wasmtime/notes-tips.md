# Notes & Tips

- The current performance gap between wasm and native in DLT parser seems to be SIMD optimizations since are used in the implementation. It's worth noting that wasm runtime support one thread only.
- Copying the memory doesn't seem to be the bottleneck, as we got almost nearly identical performance to native code in a simple data source implementation. 
- Frequent calls to Wasm methods from the host have a noticeable negative impact on performance. It's advisable to minimize these calls and cache data whenever possible. In the case of the parser, calling the plugin method each time parse is invoked, without unnecessary data copying, resulted in a performance that was 6 times slower than native code with asynchronous execution. Temporarily removing the asynchronous code reduced the performance difference to 1.6 times, but it still worse than the caching solution even with async as the results are about 1.35x only. 

