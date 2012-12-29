---
layout: post
slug: searcher-backbone-application-demonstration
title: Searcher - Backbone application demonstration
date: 2012-12-24 19:03
comments: true
categories:
- Backbone.js
- JavaScript
tags:
- Backbone.js
- JavaScript
---


In this article we will build Backbone.js application along with jQuery, underscore.js and require.js. The aim of this article is to demonstrate the use of Backbone components. As we all probably know, there are more then one ways to build Backbone applications so feel comfortable to adopt what you like.   
At the end of this article we will have Backbone searcher application which will know to make searches using different search providers. You can see our final application in action [here][****************] and can browse and download the code [here][****************].

Application Flow
================

index.html
----------
Let's begin with our application flow. After typing the url, the browser starts loading the index.html file:
``` html /index.html
<!doctype html>
<html>
    <head>
        <title></title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" href="css/style.css" type="text/css"/>       
        <script data-main="js/main" src="js/libs/require.js"></script>
    </head>
    <body>
        <header>
            <nav class="search"></nav>
        </header>
        <div class="container">
            <aside class="side-bar">
                <div id="term-history"></div>
            </aside>
            <section class="content">
            </section>
        </div>
    </body>
</html>
```
The index.html file contains the layout of our application which include placeholders for the search buttons, the history section and the search results area. It also includes reference to css file and reference to the require.js script.
When the browser loads this html file, somewhere in the road it loads the require.js script. Look closely and you'll notice that require.js script tag has additional attribute called "data-main". This attribute tells require.js to load js/main.js after require.js loads.

js/main.js
----------
This file contains two sections:
    - Configuration section that configure the require.js paths and modules.
    - Initialization section that initialize the application.
``` javascript js/main.js
require.config({
    paths: {
        jQuery: 'libs/jquery-1.8.2.min',
        Underscore: 'libs/underscore-min',
        Backbone: 'libs/backbone-min',
        tooltipster: 'libs/jquery-plugins/jquery.tooltipster',
        text: 'libs/text'
    },
    shim: {
        'jQuery': {
            exports: '$'
        },
        'Underscore': {
            exports: '_'
        },
        'Backbone': {
            deps: [
                'Underscore',
                'jQuery'
            ],
            exports: 'Backbone'
        },
        'tooltipster': {
            deps: [
                'jQuery'
            ]
        }
    }
});

require([
    'router',
    'app'
], function(Router, app) {
    var router = new Router();
    Backbone.history.start();
    app.initialize(router);
});
```
require.js configuration allows us to map modules paths to modules names. For example, jQuery.js file is located in "libs/jquery-1.8.2.min". Whenever we wish mark jQuery as a dependency, we will have to write this long path. Since jQuery is basic module and we probably use it a lot, it is better to map its path.
require.js knows to work with AMD (***********) modules. The AMD structure tells require.js what are the dependencies and which object to return. The purpose of the shim configuration is to tell require.js for each un-AMD module what is its dependencies and which object to return.
After the configuration we ask require.js to load js/app.js and js/router.js and after that execute a function. This function gets as parameter the two objects require.js required to resolve, initializes the router and Backbone.history, and initializes the application.
We will get to this point later and see how the application initialized, but first it is necessary to understand the application components.

Application Components
======================

models/query.js
---------------
As I mentioned before, this application make searches among different search providers. The input it gets from the user is a search term and a search provider. So, we need a model to store this information. Actually, a single instance of this model will serve us during the entire use of the application. Each time the user makes a different search (change the search term or provider), the model instance changes. Later, those model changes will trigger the search.
```javascript models/query.js
define([
    'Underscore',
    'Backbone'
], function(_, Backbone) {
    var QueryModel = Backbone.Model.extend({
        defaults: {
            term: '',
            sourceId: ''
        }
    });
    return QueryModel;
});
```
QueryModel has two attributes. "term" for holding the search term and "sourceId" for holding the search provider.
