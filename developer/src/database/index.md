# Databases in Chipmunk

This document outlines the key requirements for the database used in Chipmunk to store parsed messages, supporting windowed delivery of logs to the front-end, along with efficient search (including regex) and sorting capabilities.

## Requirements

* **Simple Bundling:** The database should be easy to include and distribute as part of the Chipmunk application bundle.
* **In-Process Operation:** The database should ideally run within the same process as Chipmunk. This avoids Chipmunk needing to start and manage a separate database server process on startup.
* **Efficient Paging:** The database must support efficient retrieval of result subsets using paging mechanisms (e.g., based on offset and limit).
* **Efficient Regex Search:** The database must provide efficient capabilities for searching data using regular expressions.
* **Robust Sorting:** The database must offer strong and efficient support for sorting query results according to various criteria.
