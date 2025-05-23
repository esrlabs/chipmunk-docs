# Comparison Results

This document presents the performance comparison and key observations from testing various database options for Chipmunk. Benchmarks were conducted by parsing a DLT file (405 MB, containing 1,917,847 records) and writing the results to each database in chunks, unless otherwise specified.

## SQLite

### Performance:

#### Parse and Write:

These results reflect the time taken to parse the DLT file and write the extracted records to the SQLite database in chunks.

* **File size:** 405 MB
* **Number of records:** 1,917,847
* **Time (seconds):** 
  - Approximately 10.9 seconds with default journal mode (e.g., from runs like 10.836s, 11.098s)
  - Approximately 9.1 seconds with journal mode set to off. 

### Chosen Rust Driver: `Rusqlite`

For interacting with SQLite, `Rusqlite` was selected over `sqlx` as the preferred Rust driver due to the following advantages:

* **Optimized Performance:** Being a direct and focused binding to SQLite, `Rusqlite` provides excellent performance.
* **Native Function Injection:** Offers full support for embedding custom Rust functions directly into SQL queries, enabling advanced custom logic within the database.
* **Flexible Async Integration:** While `Rusqlite` itself is synchronous, it allows for seamless integration into asynchronous Rust applications. Developers can manage async operations by using mechanisms like `tokio::task::spawn_blocking` or by handling connections on separate tasks with communication async channels.

## DuckDB

### Performance:

#### Parse and Write:

These results reflect the time taken to parse the DLT file and write the extracted records to the DuckDB database in chunks.

* **File size:** 405 MB
* **Number of records:** 1,917,847
* **Time (seconds):** 
  - Approximately 17.1 with cache and created appender each flush call. 
  - Approximately 11.2 with using the same appender (with unsafe Rust code).

## SurrealDB

* **Not Ready for Production (Yet):** This database is very new. There are many recent reports of it being slow and difficult to work with, especially when errors happen, as it doesn't always show useful information neither in return errors nor in database logs.
* **Slow for Many Inserts:** It doesn't have a good way to put many logs into the database all at once (in chunks). This makes writing a lot of data much slower compared to other databases.

For these reasons, **further investigation into SurrealDB will not be pursued.**

### Performance:

#### Write:

For testing, we measured how long it took to put about 2 million fake records into SurrealDB. We didn't include the time it takes to parse files, just the writing part.

* **Time (seconds):** About 52.33 seconds. This was much slower than the other databases we tested.

## Performance Comparison:

### Writing Logs into Database:

This table summarizes the approximate time taken (in seconds) to write log records. For SQLite and DuckDB, this includes parsing a 405MB DLT file (1,917,847 records) and writing the results. For SurrealDB, it represents writing a comparable number of pre-generated dummy records.

| Target | Time (s) |
|---|---|
| Plain Text File | 7.37 |
| SQLite jmode=default | 10.83 |
| SQLite jmode=off | 9.1 |
| DuckDB | 17.08 |
| DuckDB (unsafe) | 11.25 |
| SurrealDB | 52.33 |

### Paging

Paging involves retrieving results in smaller, manageable chunks. We tested two modes: forward paging (retrieving the next chunk) and backward paging (retrieving the previous chunk). All reported times are in microseconds.

We assessed performance using two common SQL paging methods:

* **1. `WHERE` clause paging:** This method uses a `WHERE` clause on an indexed column (e.g., an ID or timestamp) to define the boundaries of the page.
    Example: `SELECT * FROM messages WHERE id >= {start_id} AND id <= {end_id}`

* **2. `OFFSET` & `LIMIT` paging:** This method skips a number of rows (`OFFSET`) and then retrieves a limited set (`LIMIT`).
    Example: `SELECT * FROM messages LIMIT {count} OFFSET {offset}`

#### SQLite

* **Paging with `WHERE` clause (using indexed column):**
    * Forward paging: 80 microseconds
    * Backward paging: 79 microseconds

* **Paging with `OFFSET` & `LIMIT`:**
    SQLite's performance degrades significantly when using this method on large datasets. For instance, retrieving the last 100 rows from a database with 2 million records took approximately 500,000 microseconds (500 milliseconds), making this approach impractical for efficient navigation.

#### DuckDB

* **Paging with `WHERE` clause (using indexed column):**
    * Forward paging: 742 microseconds
    * Backward paging: 758 microseconds

* **Paging with `OFFSET` & `LIMIT`:**
    * Forward paging: 1,170 microseconds
    * Backward paging: 1,208 microseconds
