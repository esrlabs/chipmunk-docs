# Benchmarking Asynchronous Functions

Asynchronous functions run within an async runtime, which can introduce overhead, especially when benchmarking small, simple functions (e.g., using mocks).

[Criterion](https://github.com/bheisler/criterion.rs) supports asynchronous benchmarking and allows users to configure the runtime. It also provides settings that can reduce the overhead introduced by the async runtime.

## Configuring Criterion with Async Runtimes

To minimize noise from the runtime, consider the following:

### Use a New Runtime Instance for Each Iteration

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

### Increase Warm-up Time

Allow the system to stabilize by increasing the warm-up time. This ensures that faulty runtime configurations are minimized when the system is cold.

### Additional Configurations

- **Increase sample size and measurement time**: Reduces noise and outliers.
- **Lower significance level**: Helps with noisy benchmarks to reduce false positives changes.
- **Raise noise threshold**: Reduces false positives in performance changes.

### Example of the Configuring:

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
