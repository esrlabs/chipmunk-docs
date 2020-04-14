---
date: 2020-01-21
title: Dealing with huge files
categories:
  - tech
  - performance
author_staff_member: oliver
---

With well-performing desktop and notebook computers, it should no longer be an issue to quickly work with large log files. But unfortunately, this is not as straight forward as you might think. Especially when working with windows, the out-of-the-box tools just do not cut it.

<img src="{{ site.baseurl }}/images/notepad_indexing.png" alt="Notepad" title="Notepad"
  style="width: 50%; display:block; margin-left:auto; margin-right:auto;" />

A developer or sysadmin should not have to worry about the incapabilities of the tools but the content of the log file.

## Large is not Huge

Of course, there are solutions available, even though you need to search for them. But things often go south when files get too large. But what should we consider too large? I'd say as long as your system can deal with a huge file on disk, all functionality of a good log viewing tool should be available with a minimum performance impact.

![Notepad]({{ site.baseurl }}/images/iceberg.jpg)

Let's say you have a 10 GByte log file. You should not have to wait when opening it and you should have excellent performance when executing search requests for the whole document.

## Why are we so fast?

All performance intense operations in chipmunk are implemented in Rust and great care was taken to make them efficient. Data is processed lazily and thus even the biggest files can be processed quickly. For searching, we rely on the brilliant [ripgrep tool](https://github.com/BurntSushi/ripgrep) which is the fastest search tool around to our knowledge.

Here is an unscientific benchmark for dealing with a 1.7GByte file. We tried multiple applications that are known for their ability to deal with huge files. These are the applications we tried:
logExpert (a nice log-viewer for windows)
Sublime (fast native editor for macOS)
bare Vim
BBEdit (very fast native editor for macOS)
glogg (awesome logging tool)
chipmunk
Tests were conducted on a powerful MacBook Pro (2.3GHz 8-Core) and with both the macOS version of chipmunk and the Windows version running in a virtual machine.

![Performance]({{ site.baseurl }}/images/performance.png)

Another important use-case is, of course, executing searches across the whole content. The search in `logExpert` took more than 4 minutes and the results were thus excluded.

![Performance]({{ site.baseurl }}/images/search_performance.png)

While chipmunks' performance is good it is necessary to point out that we assume the target audience (developers, sysadmins, analysts) have access to fast hardware with SSD drives. We haven't tested chipmunk on old hardware with HDD drives but we expect that our performance will be worse here since we make extensive use of the underlying disk system for any huge files.

Photo by Hubert Neufeld on Unsplash