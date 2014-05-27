---
comments: true
date: 2014-05-28 22:45:45
layout: post
slug: back-button-behavior-on-a-page-with-an-iframe
title: Back Button Behavior on a Page With an iframe
spot: angularjs
categories:
- JavaScript
- AngularJS
tags:
- JavaScript
- AngularJS
---

I am developing a widget for websites. This widget lays inside an iframe in a website's page. One of my users (which is a site owner) complained about a weird behavior of my widget. On pages where the widget was implemented, the browser's back button didn't work properly. Instead of navigating the user to the previous page on the website, the back button navigated the user to the previous page inside the iframe.
<!-- more -->

Let me show you an example. This <a target="_blank" href="/code/back-button-behavior-on-a-page-with-an-iframe/problem/page1.html">demo page</a> includes two pages. The first page contains nothing but a link to the second page. When clicking on the link, we are redirected to the second page that contains an iframe. At this point, looking on the browser's history will show us only the first page as expected:

<img src="/code/back-button-behavior-on-a-page-with-an-iframe/problem/images/page2.png" />

In order to demonstrate navigation inside an iframe, the iframe in the second page contains a page with an anchor. This anchor refers to a different page. A click on the anchor causes navigation inside the iframe, but also adds a new history entry of the second page:

<img src="/code/back-button-behavior-on-a-page-with-an-iframe/problem/images/iframe2.png" />

Pressing back will not return us back to the first page. Instead, it will change the iframe's page and this is not the desired behavior.   
What we really want is the iframe's navigation not to interfere the browser's navigation. Pressing the back button should take us back to the first page and not to the previous iframe's page.

***It appears that any location change in the iframe is stored in the browser's history.***

Once the problem is understood, the solution is pretty simple. Whenever the user navigates inside the iframe, we don't want to add a new entry to the history. In order to do that, I'd like to explain a bit about anchors.   

## How anchors work?
When an anchor is clicked, it navigates to the new page and the new location is added to the browser's hitory. But, if the url is the same as the current url, no history entry is added and the anchor only performs a page refresh. It is easy to verify what I am saying here by creating a page that contains a link to itself. Clicking on this anchor only refreshes the page and no history entry is added.   

## history.replaceState() To The Rescue
Luckily HTML5 gave us <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history" target="_blank">a great API for controlling the history</a>. `window.history` exposes useful methods that let us manipulate the contents of the history stack. Among these methods we can find the `replaceState()` method. `history.replaceState()` can modify the current history entry and associate it with the current document.   
Assuming we have the following anchor inside an iframe's page: `<a href="iframe2.html">iframe page 2</a>`. Clicking on it redirects us to `page2.html` and adds a new history entry for that page. If the current location, prior to the anchor's action, is the same as the anchor's url, then no new history entry will be added.   
Let's manipulate the history and set the current location to the anchor's url before the anchor performs it's action:
```javascript Prevent anchors to add history entry
    var anchors = document.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        anchor.addEventListener('click', function(event) {
            history.replaceState(null, null, anchor.href);
        }, false);
    }
```
This script runs through all the page's anchors and attaches a click event. Whenever the user clicks on an anchor, the current location is replaced with the anchor's href. And here we prevented from another history entry to be added.   
Keep in mind that this script has to run at the end of the page, after the DOM has loaded.   
Here You can see the <a target="_blank" href="/code/back-button-behavior-on-a-page-with-an-iframe/solution/page1.html">solution</a>. Navigating inside the iframe doesn't create history entry:

<img src="/code/back-button-behavior-on-a-page-with-an-iframe/solution/images/iframe2.png" />



I spent a lot of time trying to understand the behavior of anchors and history and finding a solution for the back button issue. I hope you'll find this explanation interesting and useful.   
Thanks for reading,
NaorYe



