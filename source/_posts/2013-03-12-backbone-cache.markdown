---
layout: post
slug: backbone-cache
title: Backbone Cache
spot: backbone.js
date: 2013-03-12 22:37
comments: true
categories:
- Backbone.js
- JavaScript
tags:
- Backbone.js
- JavaScript
---

Caching collections and models in Backbone allows to save server calls and return the result faster to the user. This means happier server and happier users. This article will guide you how to implement Backbone caching.
<!-- more -->

In order to support caching in Backbone, first, I've created a Cache class that has the basic cache behavior and knows to cache key-value items. Then, I've created Backbone.CachedModel and Backbone.CachedCollection classes and override their fetch method so it will search the cache before fetching from the server. 

Cache Class
-----------
```javascript Backbone.Cache class
Backbone.Cache = function() {
    this.store = {};
};
$.extend(Backbone.Cache.prototype, Backbone.Events, {
    set: function(key, value) {
        this.trigger("set", key, value);
        this.store[key] = value;
    },
    has: function(key) {
        var isHas = !!this.store[key];
        this.trigger("has", key, isHas);
        return isHas;
    },
    get: function(key) {
        var value = this.store[key];
        this.trigger("get", key, value);
        return value;
    },
    remove: function(key) {
        var value = this.store[key];
        this.trigger("remove", key, value);
        delete this.store[key];
        return value;
    },
    clear: function() {
        this.trigger("clear");
        this.store = {};
    }
});
```
Each Cache instance holds an object that stored the data, and its methods manage this object. Cache also extends from Backbone.Events so it would be able to listen to events and trigger some.

Fetch Cache
-----------
In order to cache fetching results of a model, we need to know the key of the cache item and the cache object instance in which the item stored in. Therefore, each model or collection that needs caching has to define two properties: cacheKey and cacheObject.
Lets create Backbone.CachedModel and override it's fetch method. Backbone.CachedCollection's new fetch is pretty much the same.

```javascript Backbone.Model fetch override
Backbone.CachedModel = Backbone.Model.extend({
    fetch: function(options) {
        // If the model has required info for cache
        if (this.cacheKey && this.cacheObject) {
            options = options || {};
            var cacheObject = this.cacheObject,
                cacheKey = this.cacheKey,
                success = options.success;

            // Checking whether the cache object already holds the required data
            if (cacheObject.has(cacheKey)) {
                var resp = cacheObject.get(cacheKey);

                // Do the same as the fetch method does when the data received
                this.set(this.parse(resp, options), options);
                if (success) success(this, resp, options);

                // Returns deferred as the original fetch
                return $.Deferred().resolve();
            } else {
                // The cache object doesn't hold the required data
                // Preparing success method that set the cache 
                options.success = function(entity, resp, options) {
                    cacheObject.set(cacheKey, resp);
                    if (success) success(entity, resp, options);
                };
                // Calling the original fetch
                return Backbone.Model.prototype.fetch.call(this, options);
            }
        } else {
            // No cache for this model, calling the original fetch
            return Backbone.Model.prototype.fetch.call(this, options);
        }
    }
});
```
That's all! now, each model or collection that has cacheKey and cacheObject properties now cached.

Usage Example
-------------
First, there must define a cache object. There can be more then cache objects according to the need. For example, application global cache for caching application data or user cache for caching session user data.

```javascript Define global application cache
app.globalCache = new Backbone.Cache();
```

Next, define the model and set cacheKey and cacheObject. In this example app.globalCache is used to cache the fetch results. Also, the results will be cached with the key "UserPermissions_X" (X is the user id). 

```javascript Define UserPermissions model
var UserPermissions = Backbone.CachedModel.extend({
    cacheObject: app.globalCache,
    initialize: function() {
        var userId = this.get('id');
        if (userId) {
            this.cacheKey = "UserPermissions_" + userId;
        }
    },
    urlRoot: 'api/user/permissions'
});
```

Now, somewhere in the application, call fetch to get the user permissions. The fetch method will ask the server for the data and then cache it.

```javascript Fetch user permissions
var user1Permissions = new UserPermissions({ id: 1 });
user1Permissions.fetch();
```

Later in the application, there is a need to get again the user permissions. calling fetch will immediately retrieve the user permissions from the cache object.

```javascript Get user permissions from cache
var permissions = new UserPermissions({ id: 1 });
permissions.fetch();
```

Download & GitHub
-----------------
* <a href="../code/backbone-cache/backbone-cache.zip" target="_blank">Backbone Cache Download</a>
* <a href="https://github.com/naorye/BackboneCache" target="_blank">Backbone Cache GitHub Repository</a>