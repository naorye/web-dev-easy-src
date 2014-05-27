---
comments: true
date: 2014-03-08 20:44:14
layout: post
slug: interceptors-in-angularjs-and-useful-examples
title: Interceptors in AngularJS and Useful Examples
spot: angularjs
categories:
- JavaScript
- AngularJS
tags:
- JavaScript
- AngularJS
---

The `$http` service of AngularJS allows us to communicate with a backend and make HTTP requests. There are cases where we want to capture every request and manipulate it before sending it to the server. Other times we would like to capture the response and process it before completing the call. Global http error handling can be also a good example of such need. Interceptors are created exactly for such cases. This article will introduce AngularJS interceptors and will provide some useful examples.
<!-- more -->

## What are Interceptors?
The `$httpProvider` provider contains an array of interceptors. An interceptor is simply a regular service factory that is registered to that array. This is how we create an interceptor:
```javascript Interceptor declaration
module.factory('myInterceptor', ['$log', function($log) {
    $log.debug('$log is here to show you that this is a regular factory with injection');

    var myInterceptor = {
        ....
        ....
        ....
    };

    return myInterceptor;
}]);
```
And then add it by it's name to `$httpProvider.interceptors` array:
``` javascript add the interceptor to $httpProvider.interceptors
module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('myInterceptor');
}]);
```
Interceptors allow you to:

* **Intercept a request by implementing the `request` function:** This method is called before `$http` sends the request to the backend, so you can modify the configurations and make other actions. This function receives the request configuration object as a parameter and has to return a configuration object or a promise. Returning an invalid configuration object or promise that will be rejected, will make the `$http` call to fail.   

* **Intercept a response by implementing the `response` function:** This method is called right after `$http` receives the response from the backend, so you can modify the response and make other actions. This function receives a response object as a parameter and has to return a response object or a promise. The response object includes the request configuration, headers, status and data that returned from the backend. Returning an invalid response object or promise that will be rejected, will make the `$http` call to fail.   

* **Intercept request error by implementing the `requestError` function:** Sometimes a request can't be sent or it is rejected by an interceptor. Request error interceptor captures requests that have been canceled by a previous request interceptor. It can be used in order to recover the request and sometimes undo things that have been set up before a request, like removing overlays and loading indicators, enabling buttons and fields and so on. 

* **Intercept response error by implementing the `responseError` function:** Sometimes our backend call fails. Other times it might be rejected by a request interceptor or by a previous response interceptor. In those cases, response error interceptor can help us to recover the backend call.

## Asynchronous Operations
Sometimes there is a need to make some asynchronous operations inside the interceptor. Luckily AngularJS allows us to return a promise that will be resolved later. This will defer the request sending in case of request interceptor and will defer the response resolving in case of response interceptor.
```javascript Make asynchronous operations in request interceptor
module.factory('myInterceptor', ['$q', 'someAsyncService', function($q, someAsyncService) {
    var requestInterceptor = {
        request: function(config) {
            var deferred = $q.defer();
            someAsyncService.doAsyncOperation().then(function() {
                // Asynchronous operation succeeded, modify config accordingly
                ...
                deferred.resolve(config);
            }, function() {
                // Asynchronous operation failed, modify config accordingly
                ...
                deferred.resolve(config);
            });
            return deferred.promise;
        }
    };

    return requestInterceptor;
}]);
```
In this example, the request interceptor makes an asynchronous operation and updates the config according to the results. Then it continues with the modified config. If `deferred` is rejected, the http request will fail.   
The same applies for response interceptor:
```javascript Make asynchronous operations in response interceptor
module.factory('myInterceptor', ['$q', 'someAsyncService', function($q, someAsyncService) {
    var responseInterceptor = {
        response: function(response) {
            var deferred = $q.defer();
            someAsyncService.doAsyncOperation().then(function() {
                // Asynchronous operation succeeded, modify response accordingly
                ...
                deferred.resolve(response);
            }, function() {
                // Asynchronous operation failed, modify response accordingly
                ...
                deferred.resolve(response);
            });
            return deferred.promise;
        }
    };

    return responseInterceptor;
}]);
```
Only when `deferred` is resolved, the request will succeed. If `deferred` is rejected, the request will fail.

## Examples
In this section I'll provide some examples to AngularJS Interceptors in order to give a good understanding of how to use them and how they can help you. Keep in mind that the solutions I provide here are not necessarily the best or the most accurate solutions.

### Session Injector (request interceptor)
There are two ways of implementing server side authentication. The first one is to use the traditional Cookie-Based Authentication that uses server side cookies to authenticate the user on each request. The other approach is Token-Based Authentication. When the user logs in, he gets `sessionToken` from the backend. This `sessionToken` identifies the user in the server and is sent to the server on each request.   
The following `sessionInjector` adds `x-session-token` header to each intercepted request (in case the current user is logged in): 
```javascript Session Injector
module.factory('sessionInjector', ['SessionService', function(SessionService) {
    var sessionInjector = {
        request: function(config) {
            if (!SessionService.isAnonymus) {
                config.headers['x-session-token'] = SessionService.token;
            }
            return config;
        }
    };
    return sessionInjector;
}]);
module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('sessionInjector');
}]);
```
And now creating a get request:
```javascript
$http.get('https://api.github.com/users/naorye/repos');
```
The configuration object before intercepted by `sessionInjector`:
```javascript
{
    "transformRequest": [
        null
    ],
    "transformResponse": [
        null
    ],
    "method": "GET",
    "url": "https://api.github.com/users/naorye/repos",
    "headers": {
        "Accept": "application/json, text/plain, */*"
    }
}
```
The configuration object after intercepted by `sessionInjector`:
```javascript
{
    "transformRequest": [
        null
    ],
    "transformResponse": [
        null
    ],
    "method": "GET",
    "url": "https://api.github.com/users/naorye/repos",
    "headers": {
        "Accept": "application/json, text/plain, */*",
        "x-session-token": 415954427904
    }
}
```

### Timestamp Marker (request and response interceptors)
Let's measure the time it takes to get a backend response using interceptors. It is done by adding a timestamp for each request and response:
```javascript Timestamp Marker
module.factory('timestampMarker', [function() {
    var timestampMarker = {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}]);
module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('timestampMarker');
}]);
```
And now we can do:
```javascript
$http.get('https://api.github.com/users/naorye/repos').then(function(response) {
    var time = response.config.responseTimestamp - response.config.requestTimestamp;
    console.log('The request took ' + (time / 1000) + ' seconds.');
});
```
Here you can find an <a href="/code/interceptors-in-angularjs-and-useful-examples/timestamp-marker.html" target="_blank">example for the Timestamp Marker</a>.

### Request Recover (request error interceptor)
In order to demonstrate a request error interceptor we have to simulate a situation where a previous interceptor rejects the request. Our request error interceptor will get the rejection reason and will recover the request.   
Let's create two interceptors: `requestRejector` and `requestRecoverer`.   
```javascript Request Recoverer
module.factory('requestRejector', ['$q', function($q) {
    var requestRejector = {
        request: function(config) {
            return $q.reject('requestRejector');
        }
    };
    return requestRejector;
}]);
module.factory('requestRecoverer', ['$q', function($q) {
    var requestRecoverer = {
        requestError: function(rejectReason) {
            if (rejectReason === 'requestRejector') {
                // Recover the request
                return {
                    transformRequest: [],
                    transformResponse: [],
                    method: 'GET',
                    url: 'https://api.github.com/users/naorye/repos',
                    headers: {
                        Accept: 'application/json, text/plain, */*'
                    }
                };
            } else {
                return $q.reject(rejectReason);
            }
        }
    };
    return requestRecoverer;
}]);
module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('requestRejector');
    // Removing 'requestRecoverer' will result to failed request
    $httpProvider.interceptors.push('requestRecoverer'); 
}]);
```
And now, if we do the following, we will get the log `success` even though `requestRejector` rejected the request:
```javascript
$http.get('https://api.github.com/users/naorye/repos').then(function() {
    console.log('success');
}, function(rejectReason) {
    console.log('failure');
});
```
Here you can find an <a href="/code/interceptors-in-angularjs-and-useful-examples/request-recover.html" target="_blank">example for the Request Recover</a>.

### Session Recoverer (response error interceptor)
There are times, in our single page application, where the session gets lost. Such situation might happen due to session expiration or a server error. Let's create an interceptor that will recover the session and resend the original request again automatically (for situations where the session expired).   
For the example purposes, let's assume that the http status code for session expiration is 419.
```javascript Session Recoverer
module.factory('sessionRecoverer', ['$q', '$injector', function($q, $injector) {
    var sessionRecoverer = {
        responseError: function(response) {
            // Session has expired
            if (response.status == 419){
                var SessionService = $injector.get('SessionService');
                var $http = $injector.get('$http');
                var deferred = $q.defer();

                // Create a new session (recover the session)
                // We use login method that logs the user in using the current credentials and
                // returns a promise
                SessionService.login().then(deferred.resolve, deferred.reject);
        
                // When the session recovered, make the same backend call again and chain the request
                return deferred.promise.then(function() {
                    return $http(response.config);
                });
            }
            return $q.reject(response);
        }
    };
    return sessionRecoverer;
}]);
module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('sessionRecoverer');
}]);
```
This way, whenever a backend call fails due to session expiration, `sessionRecoverer` creates a new session and performs the backend call again.

## Summary
In this article I explained about AngularJS interceptors. I presented `request`, `response`, `requestError` and `responseError` interceptors and described how and when to use them. I also provided real world useful examples that can help you in your development.   

I hope you enjoyed reading this article as much as I enjoyed writing it!   
Good Luck!   
NaorYe