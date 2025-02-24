// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="01_usage/01_chapter.html"><strong aria-hidden="true">1.</strong> Usage</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="01_usage/searching_and_filtering.html"><strong aria-hidden="true">1.1.</strong> Searching and Filtering</a></li><li class="chapter-item expanded "><a href="01_usage/bookmarks.html"><strong aria-hidden="true">1.2.</strong> Working with Bookmarks</a></li><li class="chapter-item expanded "><a href="01_usage/commenting.html"><strong aria-hidden="true">1.3.</strong> Commenting</a></li><li class="chapter-item expanded "><a href="01_usage/charts.html"><strong aria-hidden="true">1.4.</strong> Charts</a></li><li class="chapter-item expanded "><a href="01_usage/concatenation.html"><strong aria-hidden="true">1.5.</strong> Concatenate Files</a></li><li class="chapter-item expanded "><a href="01_usage/merging.html"><strong aria-hidden="true">1.6.</strong> Merging Files</a></li><li class="chapter-item expanded "><a href="01_usage/time_range.html"><strong aria-hidden="true">1.7.</strong> Time Range</a></li><li class="chapter-item expanded "><a href="01_usage/dlt.html"><strong aria-hidden="true">1.8.</strong> DLT support</a></li><li class="chapter-item expanded "><a href="01_usage/keyboard_shortcuts.html"><strong aria-hidden="true">1.9.</strong> Keyboard Shortcuts</a></li><li class="chapter-item expanded "><a href="01_usage/command_line.html"><strong aria-hidden="true">1.10.</strong> Command line</a></li></ol></li><li class="chapter-item expanded "><a href="02_extensions/01_about.html"><strong aria-hidden="true">2.</strong> Developing Plugins</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="02_extensions/02_create.html"><strong aria-hidden="true">2.1.</strong> A quick start</a></li><li class="chapter-item expanded "><a href="02_extensions/03_defaults.html"><strong aria-hidden="true">2.2.</strong> Default plugins</a></li><li class="chapter-item expanded "><a href="02_extensions/04_api.html"><strong aria-hidden="true">2.3.</strong> Plugin API</a></li></ol></li><li class="chapter-item expanded "><a href="03_contributing/01_chapter.html"><strong aria-hidden="true">3.</strong> Contributing</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="03_contributing/developer_docs.html"><strong aria-hidden="true">3.1.</strong> Native Development</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
