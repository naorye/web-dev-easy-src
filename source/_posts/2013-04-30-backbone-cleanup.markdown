---
layout: post
slug: backbone-cleanup
title: Backbone Cleanup
spot: backbone.js
date: 2013-04-30 21:09
comments: true
categories:
- Backbone.js
- JavaScript
tags:
- Backbone.js
- JavaScript
---

Backbone allows our users to browse our website without refreshing the page. Each page the user visits consists of several Backbone views which are replaced whenever the user navigates. Views reflect our data models and interact with each other. This can be done by listening and triggering events which add functionality to the page. Whenever the view is replaced, there is a need to clean up the removed view, unbind events and remove unmanaged structure.   
This article suggests a solution to the views cleanup problem.<!-- more -->   
Keep in mind that this is only a suggestion as Backbone doesn't bind us to a specific solution. Your solution should be the one that fit your application structure and requirements.


Cleanup Router
--------------
We want to cleanup views. In order to do this, we have to find where and when a view is not relevant anymore. After thinking a little I understood that this resides somewhere inside the router, the place where views are replaced by other views. Actually, we want to cleanup the view **right before** the navigation. Unfortunately, Backbone.Router has no "before-navigate" event, so we have to override Router's 'navigate()' method and do whatever we want before calling the original 'navigate()' method. Let's define the Router's 'currentView' member as a reference to the current visible view. Then we can do:  
```javascript Backbone.CleanupRouter class first sketch
Backbone.CleanupRouter = Backbone.Router.extend({
    navigate: function() {
        if (this.currentView) {
            this.currentView.cleanupAll();
            this.currentView = null;
        }
        Backbone.Router.prototype.navigate.apply(this, arguments);
    }
});
```
This way, each time the user navigates between pages, the router calls the current view's 'cleanupAll()' method and then do the navigation.   
In order to let instances of such a router to mark the current view, let's add 'markCurrentView()' method:
```javascript Backbone.CleanupRouter class second sketch
Backbone.CleanupRouter = Backbone.Router.extend({
    navigate: function(fragment) {
        if (this.currentView) {
            this.currentView.cleanupAll();
            this.currentView = null;
        }
        Backbone.Router.prototype.navigate.apply(this, arguments);
    },
    markCurrentView: function(view) {
        this.currentView = view;
    }
});
```
Now, CleanupRouter's instance can be something like:
```javascript Backbone.CleanupRouter instance example
var router = Backbone.CleanupRouter.extend({
    routes: {
        'page-a': 'pageA'
    },
    pageA: function() {
        var view = // create a view for page A
        this.markCurrentView(view);
    }
});
```
After looking on the original Backbone.Router's 'navigate()' method, I noticed that there are some cases where the navigate exits without replacing the view (for example, navigation to the same current route should do nothing). In such cases, we don't need to cleanup the current view. Let's change our custom 'navigate()' to exit in those cases:
```javascript Backbone.CleanupRouter class final sketch
var routeStripper = /^[#\/]/;
Backbone.CleanupRouter = Backbone.Router.extend({
    navigate: function(fragment) {
        // Filter cases where navigate exists without navigate
        if (!Backbone.History.started) return false;
        var frag = (fragment || '').replace(routeStripper, '');
        if (Backbone.history.fragment == frag) return;

        if (this.currentView) {
            this.currentView.cleanupAll();
            this.currentView = null;
        }
        Backbone.Router.prototype.navigate.apply(this, arguments);
    },
    markCurrentView: function(view) {
        this.currentView = view;
    }
});
```

Cleanup View
------------
Now we have to define a view that has a 'cleanupAll()' method. This view should clean up itself when calling 'cleanupAll()':
```javascript Backbone.CleanupView class first sketch
Backbone.CleanupView = Backbone.View.extend({
    cleanup: function() {
        // This method should be overridden by each view and should
        // contains all the cleanup commands
    },
    cleanupAll: function() {
        this.cleanup();
    }
});
```
Backbone views can hold nested views. Whenever we cleanup a view, we need to clean also it's nested views. In order to do that, each view should have a reference to all it's nested views. Let's implement this:
```javascript Backbone.CleanupView class last sketch
Backbone.CleanupView = Backbone.View.extend({
    constructor: function() {
        this.nestedViews = [];
        Backbone.View.prototype.constructor.apply(this, arguments);
    },
    setNestedView: function(view) {
        this.nestedViews.push(view);
    },
    cleanup: function() {
        // This method should be overridden
    },
    cleanupAll: function() {
        for (var i in this.nestedViews) {
            this.nestedViews[i].cleanup();
        }
        this.nestedViews = null;
        this.cleanup();
    }
});
```
Now, CleanupView's instance can be something like:
```javascript Backbone.CleanupView instance example
var view = Backbone.CleanupView.extend({
    render: function() {
        // Render current view
        var nested = // create a nested view which is
                     // also instance of CleanupView
        this.$el.append(nested.$el);

        this.setNestedView(view);
    },
    cleanup: function() {
        // Cleanup current view only
    }
});
```

Example
-------
In order to test our cleanup plugin, I have created a small application that uses it and logs the 'render()' and 'cleanup()' methods. The application contains one router of CleanupRouter type and two views of CleanupView type (with templates):

```javascript Application router
var Router = Backbone.CleanupRouter.extend({
    routes: {
        '': 'index',
        'single-view': 'singleView',
        'nested-view': 'nestedView'
    },
    index: function() {
        this.navigate('single-view', {trigger: true});
    },
    singleView: function() {
        var view = new SingleView();
        view.render();
        $('#view').empty().append(view.$el);

        this.markCurrentView(view);
    },
    nestedView: function() {
        var view = new NestedView();
        view.render();
        $('#view').empty().append(view.$el);

        this.markCurrentView(view);
    }
});
```
Our router renders instances of SingleView and NestedView according to the route. After each render we call 'markCurrentView()' in order to mark the current view.

```javascript SingleView view
var SingleView = Backbone.CleanupView.extend({
    className: 'single-view',
    template: _.template(singleViewTemplate),
    render: function() {
        app.log('Render: SingleView (' + this.cid + ')');

        var template = this.template();
        this.$el.html(template);
    },
    cleanup: function() {
        app.log('Cleanup: SingleView (' + this.cid + ')');
    }
});
```
```javascript single-view.html template
<h2>Single View</h2>
```
SingleView's template contains only a title. Each time 'render()' and 'cleanup()' are called, the application logs the action.

```javascript NestedView view
var NestedView = Backbone.CleanupView.extend({
    className: 'nested-view',
    template: _.template(nestedViewTemplate),
    events: {
        'click .add-view': 'addView'
    },
    render: function() {
        app.log('Render: NestedView (' + this.cid + ')');

        var template = this.template();
        this.$el.html(template);
    },
    cleanup: function() {
        app.log('Cleanup: NestedView (' + this.cid + ')');
    },
    addView: function() {
        var view = new SingleView();
        this.$el.append(view.$el);
        view.render();
        this.setNestedView(view);
    }
});
```
```javascript nested-view.html template
<h2>Nested View</h2>
<button class="add-view">Add View</button>
```
NestedView's template contains a title and a button. Each time this button is pressed, the view creates and appends to itself a SingleView instance. In addition, by calling 'setNestedView()', the view registers the new SingleView instance to the nested views array. As in SingleView, calls to 'render()' and 'cleanup()' are logged.   

You can see the application in action <a target="_blank" href="../code/backbone-cleanup/example/">here</a>. Try to navigate between views and add nested views in order to see in the log how 'render()' and 'cleanup()' take place in the application flow.

Download & GitHub & Demo
------------------------
* <a href="../code/backbone-cleanup/backbone-cleanup.zip" target="_blank">Backbone Cleanup Download</a>
* <a href="https://github.com/naorye/BackboneCleanup" target="_blank">Backbone Cleanup GitHub Repository</a>
* Example application in action <a target="_blank" href="../code/backbone-cleanup/example/">here</a>.

I hope you enjoyed reading this article,   
  
NaorYe