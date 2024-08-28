# Benchmarking


## Benchmarking main methods

* In general we have two main methods to do benchmarks, the first measures the execution time and the second estimates CPU cycles.
* Rust has official support for benchmarking that is used to bench the standard-library. However, this support is available currently on Rust nightly only. 
* Rust Eco-system has crates supporting the two methods, providing a similar interface to the `Bencher` from the standard-library which make it easier to write benchmarks for both of them together, or migrate from one to the other (Or to the `Bencher` once it has support on stable rust)


### Wall Clock Time Method

* This method measures the elapsed time between starting and finishing a task using the system wall clock time.
* It must run the tests many times to get more accurate results, and the results will vary between hosts' environment.
* This method isn't suitable for CI by saving bench results of master branch and compare it with different branch, because the virtual machine state can change between each run. To get best accuracy, we need to run the benches on the master and on the branch in the same run to compare them in the environment.
* The crate [criterion](https://github.com/bheisler/criterion.rs) provides a similar interface for `Bencher` from standard-library while it can run rust stable, providing more features like graphs and more control over the benchmarks themselves.
* Benchmarks for specific parts of the app can be written with mocks if needed similar to the unit tests, providing a way to bench specific functions in isolated way.
* This method doesn't demand and external support and can run cross-platform


### CPU Cycles Method

* This method estimates and compares the CPU cycles using [Valgrind Callgrind](https://valgrind.org/docs/manual/cl-manual.html).
* Each test will run once only and have results that are independent form the host state, which makes it reliable in CI pipelines
* It provides high-precision measurements since it's counting the CPU cycles which make any difference noticeable with clear numbers. 
* Currently, the crate [Iai-Callgrind](https://github.com/iai-callgrind/iai-callgrind/tree/main?tab=readme-ov-file) has support for this kind of benchmarks in Rust. 

#### Cons:

* This method can run only where [Valgrind](https://valgrind.org/) runs (Currently Linux and MacOS)
* CPU cycles don't match necessarily how much time the process took and it will still need timed benchmarks along side.
* `Iai-Callgrind` doesn't have currently a lot of recognition and support from Rust community compared to `Criterion`, however they have great documentation and the library is active development.



