# Database Initial Comparison

This document compares different database options based on the requirements outlined in the [Databases in Chipmunk](./index.md) document.

## SQLite

SQLite is a popular, lightweight, file-based database that runs in-process, making it a strong candidate to be embedded withing Chipmunk.

#### Pros:

* **Lightweight and In-Process:** Runs directly within the application process with minimal overhead.
* **Ease of Bundling:** Simple to include and distribute as part of the Rust binary, with robust crate support that compiles out-of-the-box.
* **Maturity and Reliability:** Widely used across the industry, benefiting from extensive testing and a long history.

#### Cons:

* **Concurrent Network Access:** Standard SQLite is not designed for high-concurrency network access from multiple clients out-of-the-box. While possible with specific configurations or modes, it can be complex and introduces potential security considerations compared to dedicated client-server databases.

### Rust Libraries/Drivers

Several Rust crates provide interfaces for interacting with SQLite. The primary contenders considered were `Rusqlite` and `SQLx`.

#### Rusqlite:

* Direct, idiomatic Rust binding for the SQLite library.
* Supports embedding custom Rust functions (user-defined functions) directly into SQLite queries.
* Primarily synchronous; requires manual integration with asynchronous runtimes (like `Tokio`) using mechanisms such as `spawn_blocking` or managing connections on separate tasks with channels for async operations.
* Specifically designed for SQLite.

#### SQLx:

* Asynchronous-first database toolkit with compile-time checked SQL queries.
* Provides native async support for SQLite when used with an async runtime; manages connections efficiently (e.g., via a connection pool).
* Embedding custom Rust functions is not supported as a built-in feature, requiring workarounds if needed.
* Designed as a framework supporting multiple database backends (PostgreSQL, MySQL, SQLite, etc.), providing a consistent async interface across different database types.

## DuckDB

DuckDB is another in-process analytical database, designed for fast read-only queries and suitable for embedding within applications like Chipmunk.

#### Pros:

* **Lightweight and In-Process:** Runs directly within the application process with minimal overhead.
* **Ease of Bundling:** Simple to include and distribute as part of the Rust binary, with readily available crate support.
* **Vectorized Query Execution:** Designed for high-performance analytical queries through vectorized processing.
* **Network Access via HTTP:** Can serve a database file over HTTP, allowing read-only access from multiple clients.

#### Cons:

* **Relatively New Technology:** While stable and well-adopted, it has a shorter track record compared to SQLite.

## SurrealDB

SurrealDB is a relatively new, multi-model database written in Rust, designed for various use cases including embedded applications.

## Performance:

42877 milliseconds without parsing.

#### Pros:

* **Excellent Rust Integration:** Written in Rust, offering seamless bundling and strong support for Rust development.
* **Flexible Deployment Options:** Supports multiple use cases, including embedded (in-process), standalone client-server, and distributed database setups.
* **Modern Rust Implementation:** Built with safety in mind, provides native async support using `Tokio`, and leverages powerful Rust crates like `serde` and `nom`.
* **Multi-Model Capabilities:** Combines features from different database paradigms (e.g., relational-like queries via its SQL-like language, document, graph).

#### Cons:

* **Maturity:** As a relatively young technology, despite its rapid development and popularity, it may not yet have the extensive battle-testing and long-term track record of more established databases for all production use cases.
* **Broad Scope:** Its ambition to be a versatile, fit-for-many-use-cases database might introduce complexity or lead to unforeseen challenges in specific niche scenarios compared to databases focused on a narrower problem domain.

