# User Guide

This guide describes the most common usecases for using chipmunk.

## [Searching and Filtering](01_usage/searching_and_filtering.md)

<img src="../images/magnifying-search-lenses-tool.png" width="100" height="100">

Searching through huge logfiles

## [Concatenating logfiles](01_usage/concatenation.md)

<img src="../images/glue_together.png" width="100" height="100">

`chipmunk` can combine multiple log file. This is useful for example
when you just want to reassamble a logfile that were stored in parts.

## [merging](01_usage/merging.md)

![](../images/intersection.png)

Merging is useful if you have several log files e.g. from different
devices/processors and you want combine them by merging according to their
timestamps.

## [Charts](01_usage/charts.md)

![](../images/chart.png)

To better understand what's going on in a large logfile, it can be helpful to visualize data over
time. `chipmunk` let's you define regular expressions that match a number and to use this expression
to capture a value throughout a logfile.

## [Bookmarks](01_usage/bookmarks.md)

<img src="../images/bookmark_sign.png" width="100" height="100">

Add bookmarks to mark and remember important log entries. Jump between bookmarks with shortcuts (`j` and `k`).

## [DLT - Diagnostic Log and Trace](01_usage/dlt.md)

<img src="../images/dlt.png" width="200" height="200">

View and search and filter DLT files.
rogramming in Rust!
