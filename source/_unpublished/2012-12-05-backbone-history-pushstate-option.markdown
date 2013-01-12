---
published: false
comments: true
date: 2012-12-05 18:10:00
layout: post
slug: backbone-history-pushstate-option
title: Backbone history pushState option
wordpress_id: 165
categories:
- Backbone.js
- JavaScript
tags:
- Backbone.js
- JavaScript
- pushState
---


If you are using Backbone, you probably noticed [Backbone.history.start();](http://backbonejs.org/#History-start) function. This command starts the monitoring on hashchange events, and dispatching routes.

<!-- more -->

This function can get as option an indication whether you would like to use HTML5 pushState support:

    
    Backbone.history.start({pushState: true/false});








It is important to understand the behaviour in each case:




  * 
When {pushState: false} is used (the default behaviour), calling [router.navigate("shop")](http://backbonejs.org/#Router-navigate) will update the url using the hash sign and it will look like www.myblog.com/index.html#shop.



  * 
When using {pushState: true}, calling router.navigate("shop") will use the HTML5 pushState support and the url will look like  www.myblog.com/shop.



Keep in mind that both settings of course do not refresh the page.




Hope you will find this info useful!

