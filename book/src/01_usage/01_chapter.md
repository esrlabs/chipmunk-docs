# User Guide

This guide describes the most common usecases for using chipmunk.

## [Searching and Filtering](searching_and_filtering)

<img src="../images/magnifying-search-lenses-tool.png" width="100" height="100">

Searching through huge logfiles

## [Bookmarks](bookmarks)

<img src="../images/bookmark_sign.png" width="100" height="100">

Add bookmarks to mark and remember important log entries. Jump between bookmarks with shortcuts (`j` and `k`).

## [Commenting](commenting)

<img src="../images/comment_sign.png" width="100" height="100">

Comment line(s) of the log to have additional information about specific places in the file.

## [Charts](charts)

![](../images/chart.png)

To better understand what's going on in a large logfile, it can be helpful to visualize data over
time. `chipmunk` let's you define regular expressions that match a number and to use this expression
to capture a value throughout a logfile.

## [Concatenating logfiles](concatenation)

<img src="../images/glue_together.png" width="100" height="100">

`chipmunk` can combine multiple log file. This is useful for example
when you just want to reassamble a logfile that were stored in parts.

## [Merging](merging) 

![](../images/intersection.png)

Merging is useful if you have several log files e.g. from different
devices/processors and you want combine them by merging according to their
timestamps.

## [Time Ranges](time_range)

<img src="../images/stopwatch_sign.png" width="100" height="100">

To measure how much time passed between lines of a logfile `chipmunk` provides the **Time Range** Feature. 

## [DLT - Diagnostic Log and Trace](dlt)

<img src="../images/dlt.png" width="200" height="200">

View and search and filter DLT files.
Programming in Rust!

## [Command line](command_line)

<img src="../images/command_line.png" width="100" height="100">

It's also possible to open a file with `Chipmunk` directly from the console.
