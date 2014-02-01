---
comments: true
date: 2014-01-27 14:49:33
layout: post
slug: angularjs-logger-service-provider
title: AngularJS Logger Service Provider
spot: angularjs
categories:
- JavaScript
- AngularJS
tags:
- JavaScript
- AngularJS
---

In this article I'll create a tidy Logger for your AngularJS application. Throw this article I'll also explain what is provider and what is the difference between a provider and other services declaration in AngularJS.
<!-- more -->

##What is wrong with $log?
Nothing! Really, $log is doing the work. It is a simple service for logging, including a default implementation that writes messages into the browser's console. And thats it. But when talking about logging, I'd like a service that will print my messages nicely, something like a timestamp and maybe a hint about where the message was created. I would also like to turn off all the messages during application configuration when running on production, and maybe expose an way to turn it on. I know $logProvider has the `debugEnabled(flag)` method, but I would like to turn off all the other kinds of messages (like `info()` and `error()`) and not only debug. Later on I might like to add colors to my messages and maybe aggregate all the `error()` messages and send them somehow to me. This is why I was looking to create a new logging mechanism.   
While thinking about a way of implementations, I was thinking about using a <a href="http://docs.angularjs.org/api/AUTO.$provide#decorator" target="_blank">service decorator</a> but then I realized that I might want more then modifying the behavior of $log, like add or remove methods, or change the way $log's methods work. Eventually I decided to use a <a href="http://docs.angularjs.org/api/AUTO.$provide#methods_provider" target="_blank">service provider</a>.

##A little about AngularJS services
This section might be a little confusing, but it is really important to understand. When we calling `module.provider()`, we actually calling the 'provider()' method of the `$provide` service. This method exposed on `angular.Module`. The same is for `module.service()` and `module.factory()`, they are methods of `$provide` service that exposed on `angular.Module`. Therefore the following blocks are the same thing:
``` javascript Calling directly to module.provider(), module.service() and module.factory()
module.provider('providerName', function() { ... });
module.service('serviceName', function() { ... });
module.factory('factoryName', function() { ... });
```
```
module.config(['$provide', function($provide) {
    $provide.provider('providerName', function() { ... });
});
module.config(['$provide', function($provide) {
    $provide.service('serviceName', function() { ... });
});
module.config(['$provide', function($provide) {
    $provide.factory('factoryName', function() { ... });
});
```
More then that, `$provide.service()` and `$provide.factory()` are actually an easy way to use `$provide.provider()`:
``` javascript $provide.service() and $provide.factory() are actually $provide.provider()
$provide.service('serviceName', function() {
    this.name = 'The Catcher in the Rye';
    this.author = 'J. D. Salinger';
});
// Equals to
$provide.provider('serviceName', function() { 
    this.$get = function($injector) {
        return $injector.instantiate(function() {
            this.name = 'The Catcher in the Rye';
            this.author = 'J. D. Salinger';
        });
    };
});

$provide.factory('factoryName', function() {
    return { name: 'The Catcher in the Rye', author: 'J. D. Salinger' };
});
// Equals to
$provide.provider('serviceName', function() { 
    this.$get = function($injector) {
        return $injector.invoke(function() {
            return { name: 'The Catcher in the Rye', author: 'J. D. Salinger' };
        });
    };
});
```
As we all can see, AngularJS only knows service provider (`$provide.provider()`) and all other ways of creating services are derived.

##What service provider gives?
Besides of crating the service, service provider allows to configure the service on `module.config()` block. Look on the following 'appColor' example service that defined using a service provider:
``` javascript Sample `appColor` service provider
$provide.provider('appColor', function() { 
    var color = 'Green';
    this.setColor = function(newColor) {
        color = newColor;
    };
    this.$get = function() {
        return color;
    };
});
```
Whenever we will ask from Angular to inject `appColor`, we will get the `color` variable. But on `module.config()` blocks we can ask for `appColorProvider` which expose the provider and all it's methods and attributes. This let us configure the service before other code consumes it:
``` javascript `appColor` configuration and usage
module.config(['appColorProvider', function(appColorProvider) {
    appColorProvider.color = 'Blue';
});
...
...
module.run(['appColor', function(appColor) {
    // Will log: 'Application color is Blue'
    console.log('Application color is ' + appColor);
});
```
As you can see, service provider gave us access to the "provider" part where we can set methods or variables, and which can be accessed during configuration only. And this is what I was looking for when thinking about creating my Logger.

##Creating the Logger!
I want to create a Logger service that will print my messages in the following formats (according to the supplied arguments):    
`<timestamp> - <context>::<method name>('<message>')`
`<timestamp> - <context>: <message>`

Before integrating with Angular, let's create a Logger class that uses $log. First we will create Logger constructor and a static helper method that will create a new instance of Logger.
``` javascript Logger construction
var Logger = function(context) {
    this.context = context;
};
Logger.getInstance = function(context) {
    return new Logger(context);
};
``` 
The constructor gets context as parameter.   
I want it to be easy to interpolate variables into the message string. Therefore, let's take Douglas Crockford's <a href="http://javascript.crockford.com/remedial.html" target="_blank">supplant implementation</a> and put it as a helper in logger:
``` javascript supplant support
Logger.supplant = function(str, o) {
    return str.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
}; 
```
Now it is easy to add a method that returns a formatted timestamp:
``` javascript formatted timestamp on message
Logger.getFormattedTimestamp = function(date) {
   return Logger.supplant('{0}:{1}:{2}:{3}', [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    ]); 
}; 
```
Notice that the last two methods are generic methods and you can take them out and put in your `utils` service for example.   
Now we want to write a generic `_log()` method that gets the original method of `$log` (log, info, warm, debug or error) and uses it to print a message according to the arguments given. First I'll show my implementation and then the explanation:
```javascript generic `_log()` method
Logger.prototype = {
    // Supports the following arguments: fnName (optional), message (mandatory), supplantData (optional)
    // Length and types of arguments are checked in order to determine the usage
    _log: function(originalFn, args) {
        var now  = Logger.getFormattedTimestamp(new Date());
        var message = '', supplantData = [];
        switch (args.length) {
            case 1:
                message = Logger.supplant("{0} - {1}: {2}", [ now, this.context, args[0] ]);
                break;
            case 3:
                supplantData = args[2];
                message = Logger.supplant("{0} - {1}::{2}(\'{3}\')", [ now, this.context, args[0], args[1] ]);
                break;
            case 2:
                if (typeof args[1] === 'string') {
                    message = Logger.supplant("{0} - {1}::{2}(\'{3}\')", [ now, this.context, args[0], args[1] ]);
                } else {
                    supplantData = args[1];
                    message = Logger.supplant("{0} - {1}: {2}", [ now, this.context, args[0] ]);
                }
                break;
        }

        $log[originalFn].call(null, Logger.supplant(message, supplantData));
    },
    ...
};
```
`_log()` method first get the formatted current date. Then it checks for the arguments length and types and determine which output the user wanted to print:    

1. If the user supplied one argument, then the argument must be the message itself and `_log()` will print: `<timestamp> - <context>: <message>`   
2. If the user supplied three arguments, then the first argument is a method name, the second is the message and the third is an object of variables to interpolate with the message. For this, `_log()` will print: `<timestamp> - <context>::<method name>('<message>')`   
3. If the user provided two arguments, we need to find out whether he supplied a method name or an interpolation object. In order to figure that out, We'll check the type of the last argument. If it is a string, then it has to be the message itself while the first argument is the method name. Otherwise consider the first argument as the message and the second as array of interpolation variables. The output print will be according to this check.    

At the end, `_log()` calls the required method on $log with the interpolated message. Now the last thing to do is to implement an overrides to `log()`, `info()`, `warn()`, `debug()` and `error()`:
```javascript implement $log overrides
Logger.prototype = {
    ...
    log: function() {
        this._log('log', arguments);
    },
    info: function() {
        this._log('info', arguments);
    },
    warn: function() {
        this._log('warn', arguments);
    },
    debug: function() {
        this._log('debug', arguments);
    },
    error: function() {
        this._log('error', arguments);
    }
};
```
Finally we have a Logger! This is how we can use it:
``` javascript Logger usage example
var logger = Logger.getInstance('Example'); // Name of this file / class / module
logger.log('This is a log'); // Logs: "19:24:1:263 - Example: This is a log"
logger.warn('warn', 'This is a warn'); // Warns: "19:24:1:263 - Example::warn('This is a warn')"
logger.error('This is a {0} error! {1}', [ 'big', 'just kidding' ]); // Shouts: "19:24:1:263 - Example: This is a big error! just kidding"
logger.debug('debug', 'This is a debug for line {0}', [ 8 ]); // Logs: "19:24:1:263 - Example::debug('This is a debug for line 8')"
``` 
Now we can finally integrate our new Logger with AngularJS service provider!

##Back To AngularJS Service Provider
I wanted to create Logger provider with the ability of disable all the logs. For that I've created a provider that wraps our Logger implementation and adds a method to LoggerProvider for enable or disable Logger:
``` javascript Logger service provider
module.provider('Logger', [function () {
    var isEnabled = true;
    this.enabled = function(_isEnabled) {
        isEnabled = !!_isEnabled;
    };

    // $log injected as a dependency
    this.$get = ['$log', function($log) {
        var Logger = ...
        ... // Logger implementation

        return Logger;
    }];
}]);
```
The last thing left to do is to change the `_log()` to return immediately if isEnabled equals to false:
``` javascript enable / disable `_log()`
Logger.prototype = {
    _log: function(originalFn, args) {
        if (!isEnabled) {
            return;
        }
        ....
```
As you can see, Logger is enabled by default. In order to turn it off we just need to do:
```javascript Turn off logger
module.config(['Logger', function(Logger) {
    Logger.enabled(false);
}); 
```
Thats all!

##Summary
On this article I discussed about the difference between AngularJS factory, service and provider. I show the similarity and explained that service provider is a base method that all other ways of creating services are derived from. I explained the options of service provider over other services and the most important thing, I've created a Logger provider with you!

Here you can find <a href="https://github.com/naorye/angular-ny-logger" target="_blank">Logger GitHub Repository</a> with the source code and an demo.

NaorYe