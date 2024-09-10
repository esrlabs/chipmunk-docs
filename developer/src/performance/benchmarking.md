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


## Benchmarking Asynchronous Functions

Asynchronous functions run within an async runtime, which can introduce overhead, especially when benchmarking small, simple functions (e.g., using mocks).

[Criterion](https://github.com/bheisler/criterion.rs) supports asynchronous benchmarking and allows users to configure the runtime. It also provides settings that can reduce the overhead introduced by the async runtime.

### Configuring Criterion with Async Runtimes

To minimize noise from the runtime, consider the following:

#### Use a New Runtime Instance for Each Iteration

Asynchronous runtimes configure themselves during initialization based on system state, potentially leading to runtime overhead accumulating in one direction. Using a new runtime for each iteration helps distribute this overhead.

Example using Tokio:

```rust
// Using one runtime for all iterations leads to consistent overhead.
let runner = tokio::runtime::Runtime::new().unwrap();
bencher
  .to_async(&runner)
  .iter(|bencher| ...);

// Using a new runtime per iteration distributes the overhead.
bencher
  .to_async(tokio::runtime::Runtime::new().unwrap())
  .iter(|bencher| ...);

```

#### Increase Warm-up Time

Allow the system to stabilize by increasing the warm-up time. This ensures that faulty runtime configurations are minimized when the system is cold.

#### Additional Configurations

- **Increase sample size and measurement time**: Reduces noise and outliers.
- **Lower significance level**: Helps with noisy benchmarks to reduce false positives changes.
- **Raise noise threshold**: Reduces false positives in performance changes.

#### Example of the Configuring:

```rust
criterion_group! {
  ...
  config = Criterion::default()
    // Warm-up time allows stable spawning of multiple async runtimes.
    .warm_up_time(Duration::from_secs(10))
    // Increased measurement time and sample size reduce noise.
    .measurement_time(Duration::from_secs(20))
    .sample_size(200)
    // Settings to reduce noise in the results.
    .significance_level(0.01)
    .noise_threshold(0.03);
  ...
}
```

### Mocking Async Traits

When benchmarking generic functions with async traits, avoid calling `Future::poll()` on mocks to reduce async overhead. Achieve this by using a non-async inner function, marked as `#[inline(never)]`, within an always-inlined async function. This ensures the non-async function is used without inlining it to mimic the actual trait implementation.

Example:

```rust
trait FooTrait {
  async fn bar(&self) -> usize;
}

struct MockFoo;

impl FooTrait for MockFoo {
  #[inline(always)]
  async fn bar(&self) -> usize {
    #[inline(never)]
    fn inner_bar() -> usize {
      black_box(0)
    }

    inner_bar()
  }
}

```
This avoids calling `Future::poll()` when invoking the async function:

```rust
async some_fun(foo: FooTrait) {
  // The call can be made without awaiting.
  let val = foo.bar().await;

  // `MockFoo::bar()` inlines, avoiding future polling, since `inner_bar()` isn't async.
  let val = inner_bar();
}

```
