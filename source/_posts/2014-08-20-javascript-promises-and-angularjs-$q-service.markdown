---
comments: true
date: 2014-08-20 09:42:02
layout: post
slug: javascript-promises-and-angularjs-$q-service
title: JavaScript Promises and AngularJS $q Service
spot: angularjs
categories:
- JavaScript
- AngularJS
tags:
- JavaScript
- AngularJS
---

A promise / deferred is a very simple and powerful tool for asynchronous development. The CommonJS wiki lists <a href="http://wiki.commonjs.org/wiki/Promises" target="_blank">several implementation proposals for the promise pattern</a>. AngularJS has it's own promise implementation that was inspired by <a href="https://github.com/kriskowal/q" target="_blank">Kris Kowal's Q</a> implementation. In this article I'll introduce promises and provide useful tutorial about how to work with promises using AngularJS $q promise service.
<!-- more -->

## Promise / Deferred Motivation
In JavaScript, asynchronous methods usually use a callbacks in order to inform a success or a failure state. The Geolocation api, for example, requires success and failure callbacks in order to <a href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition" target="_blank">get the current location</a>:
```javascript Use callbacks in Geolocation api
function success(position) {
  var coords = position.coords;
  console.log('Your current position is ' + coords.latitude + ' X ' + coords.longitude);
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

navigator.geolocation.getCurrentPosition(success, error);
```
Another example is XMLHttpRequest (<a href="https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest" target="_blank">used to perform ajax calls</a>). It has `onreadystatechange` callback property that is called whenever the `readyState` attribute changes:
```javascript Callback use in XHR
var xhr = new window.XMLHttpRequest();
xhr.open('GET', 'http://www.webdeveasy.com', true);
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            console.log('Success');
        }
    }
};
xhr.send();
```
There are many other examples of asynchronicity in JavaScript. Working with callbacks gets complicated when there is a need to synchronize several asynchronous operations.   
### Sequentially Executing (Pyramid Of Doom)
Assume we have `N` asynchronous methods: `async1(success, failure)`, `async2(success, failure)`, ..., `asyncN(success, failure)` and we want to execute them sequentially, one after another, upon success. Each method gets success and failure callbacks so the solution will be:
```javascript execute asynchronous methods sequentially
async1(function() {
    async2(function() {
        async3(function() {
            async4(function() {
                ....
                    ....
                        ....
                           asyncN(null, null);
                        ....
                    ....
                ....
            }, null);
        }, null);
    }, null);
}, null);
```
And here we get the famous <a href="http://javascriptjabber.com/001-jsj-asynchronous-programming/" target="_blank">callback pyramid of doom</a>. Although there are nicer ways to write this code (separate that waterfall into functions for example), this is really hard to read and maintain.
### Parallel Executing
Assume we have `N` asynchronous methods: `async1(success, failure)`, `async2(success, failure)`, ..., `asyncN(success, failure)` and we want to execute them parallel and *at the end of all*, alert a message. Each method gets success and failure callbacks so the solution will be:
```javascript execute asynchronous methods parallel
var counter = N;

function success() {
    counter --;
    if (counter === 0) {
        alert('done!');
    }
}

async1(success);
async2(success);
....
....
asyncN(success);
```
We declared a counter with initial value equals to the total asynchronous methods to execute. When each method is done, we decrease the counter by one and check whether this was the last execution. This solution is not simple for implementation or maintain, especially when each asynchronous method passes a result value to `success()`. In such case we will have to keep the results of each execution.   

In both examples, at the time of execution of an asynchronic operation, we had to specify how it will be handled using a success callback. In other words, when we use callbacks, the asynchronic operation needs a reference to its continuation, and this continuation might not be its business. This can lead to tightly coupled modules and services which makes hard life when reusing or testing code.   

## What is Deferred / Promise?
A deferred represents the result of an asynchronic operation. It exposes an interface that can be used for signaling the state and the result of the operation it represents. It also provides a way to get the associated promise instance.   
A promise provides an interface for interacting with it's related deferred, and so, allows for interested parties to get access to the state and the result of the deferred operation.   
When creating a deferred, it's state is `pending` and it doesn't have any result. When we `reject()` or `resolve()` the deferred, it changes it's state with or without a result. Still, we can get the associated promise immediately after creating a deferred and even assign interactions with it's future result. Those interactions will occur only after the deferred rejected or resolved.   

When it comes to coupling, by using promises we can easily create an asynchronic operation before even decide what's going next after resolve. This is why coupling is looser. An asynchronic operation doesn't have to know how it continues, it only has to signal when it is ready.   

While deferred has methods for changing the state of an operation, a promise exposes only methods needed to handle and figure out the state, but not methods that can change the state. This is why return a promise and not a deferred in a function is a good practice. This prevents from external code to interfere the progress or the state of an operation.    

There are several implementations of promises in different languages (JavaScript, JAVA, C++, Python and more) and frameworks (NodeJS, jQuery for JavaScript). Sometimes it called `Future`. AngularJS has a promise implementation under the `$q` service.   

## How to use Deferrers and Promises
After understanding the motivation, now is the time to see how to use Deferrers and Promises. As said before, there are several implementations of promises, and so, different implementations may have different ways of usage. This section will use <a href="https://docs.angularjs.org/api/ng/service/$q" target="_blank">the AngularJS implementation of promise</a> - the $q service. Still, if you use a different implementation of promises, don't worry, most of the methods I'll describe here are equal for all implementations and if not, there are always an equivalent method.   

### Basic usage
First things first, let's create a deferred!
```javascript Creating a deferred
var myFirstDeferred = $q.defer();
```
Simple as can be, `myFirstDeferred` holds a deferred that can be resolved or rejected whenever an asynchronous operation is done. Assume we have an asynchronous method `async(success, failure)` that gets success and failure callbacks as parameters. When `async` is done or we want to resolve or reject `myFirstDeferred` with the result (data or error):   
```javascript Resolve and reject a deferred
async(function(data) {
    myFirstDeferred.resolve(data);
}, function(error) {
    myFirstDeferred.reject(error);
});
```
Since `$q`'s resolve and reject methods doesn't depend on context in order to work, we can simply write:
```javascript Resolve and reject a deferred
async(myFirstDeferred.resolve, myFirstDeferred.reject);
```
Now, taking the promise out of this deferred and assign operations upon success or failure is pretty easy:
```javascript Using the promise
var myFirstPromise = myFirstDeferred.promise;

myFirstPromise
    .then(function(data) {
        console.log('My first promise succeeded', data);
    }, function(error) {
        console.log('My first promise failed', error);
    });
```
Keep on mind that we can assign the success and failure operations right after creating the deferred (even before calling to `async()`) and that we can assign how many operations we like:
```javascript Using the promise several times
var anotherDeferred = $q.defer();
anotherDeferred.promise;
    .then(function(data) {
        console.log('This success method was assigned BEFORE calling to async()', data);
    }, function(error) {
        console.log('This failure method was assigned BEFORE calling to async()', error);
    });

async(anotherDeferred.resolve, anotherDeferred.reject);

anotherDeferred.promise;
    .then(function(data) {
        console.log('This ANOTHER success method was assigned AFTER calling to async()', data);
    }, function(error) {
        console.log('This ANOTHER failure method was assigned AFTER calling to async()', error);
    });
```
If `async()` success, both success methods will occur. The same is for failure.   
A good approach is to wrap asynchronous operations with a function that returns a promise. This way the caller will be able to assign success and failure callbacks the way he like, but will not be able to interfere the deferred state:
```javascript Wrap asynchronous operation
function getData() {
    var deferred = $q.defer();
    async(deferred.resolve, deferred.reject);
    return deferred.promise;
}
...
... // Later, in a different file
var dataPromise = getData()
...
...
... // Much later, at the bottom of that file :)
dataPromise
    .then(function(data) {
        console.log('Success!', data);
    }, function(error) {
        console.log('Failure...', error);
    });
```
Up to here, when we used promises, we assigned both success and failure callbacks. But, there is also a way to assign only success or only failure functions:
```javascript Assign only success or failure callback to promise
promise.then(function() {
    console.log('Assign only success callback to promise');
});

promise.catch(function() {
    console.log('Assign only failure callback to promise');
    // This is a shorthand for `promise.then(null, errorCallback)`
});
```
Passing only success callback to `promise.then()` will assign only success callback and using `promise.catch()` will assign only failure callback. `catch()` is actually a shorthand for `promise.then(null, errorCallback)`.   
In case we want to perform the same operation both on fulfillment or rejection of a promise, we can use `promise.finally()`:
```javascript Using finally
promise.finally(function() {
    console.log('Assign only success function to promise');
});
```
This is equivalent to:
```javascript
var callback = function() {
    console.log('Assign only success function to promise');
};
promise.then(callback, callback);
```

### Chaining values and promises
Assume we have an asynchronous function `async()` that returns a promise. I have this interesting block of code:
```javascript values chaining
var promise1 = async();
var promise2 = promise1.then(function(x) {
    return x+1;
});
```
As you can understand from that code, `promise1.then()` returns another promise, and I named it `promise2`. When `promise1` resolved with a value `x`, the success callback executes and returns `x+1`. At this point `promise2` is resolved with `x+1`.   
Another similar example:   
```javascript values chaining
var promise2 = async().then(function(data) {
    console.log(data);
    ... // Do something with data
    // Returns nothing!
});
```
Here, when the promise returned from `async()` resolved, the success callback does it's job and then `promise2` resolved with no data (`undefined`).   
As you can see, ***promises chain the values and always resolved after the callback occurs with the returned value***.   
In order to demonstrate it, here is a silly example that uses promises (there is no really a need to use promises here):
```javascript values chaining example
// Let's imagine this is really an asynchronous function
function async(value) {
    var deferred = $q.defer();
    var asyncCalculation = value / 2;
    deferred.resolve(asyncCalculation);
    return deferred.promise;
}

var promise = async(8)
    .then(function(x) {
        return x+1;
    })
    .then(function(x) {
        return x*2;
    })
    .then(function(x) {
        return x-1;
    });

promise.then(function(x) {
    console.log(x);
});
```
This promises chain starts with calling to `async(8)` which fulfill the promise with the value `4`. This value passes through all the success callbacks and so the value `9` will be logged (`(8 / 2 + 1) * 2 - 1`).   
   
What happens if we chain another promise (and not a value)? Assume we have two asynchronous functions, `async1()` and `async2()`, each returns a promise. Let's see the following:
```javascript promises chaining
var promise = async1()
    .then(function(data) {
        // Assume async2() needs the response of async1() in order to work
        var async2Promise = async2(data);
        return async2Promise;
});
```
Here, unlike the previous example, the success callback performs another asynchronous operation and returns a promise. The value returned from `async1().then()` is a promise as expected (`promise`), but it can be resolved or rejected according to `async2Promise` and with it's resolve result or reject reason. Let's demonstrate it (again, the usage of promises is not mandatory and for demonstration purposes only):
```javascript promises chaining example
// Let's imagine those are really asynchronous functions
function async1(value) {
    var deferred = $q.defer();
    var asyncCalculation = value * 2;
    deferred.resolve(asyncCalculation);
    return deferred.promise;
}
function async2(value) {
    var deferred = $q.defer();
    var asyncCalculation = value + 1;
    deferred.resolve(asyncCalculation);
    return deferred.promise;
}

var promise = async1(10)
    .then(function(x) {
        return async2(x);
    });

promise.then(function(x) {
    console.log(x);
});
```
First, we call `async1(10)` which on it's turn fulfills the promise on and resolve it with the value `20`. Then the success callback executed and `async(20)` returns a promise that will be fulfilled with the value `21`. Therefore `promise` will be resolved with the value `21` and this what will be logged.   
A nice thing is that I can write the same example but with more readable code:
```javascript promises chaining - readable
function logValue(value) {
    console.log(value);
}

async1(10)
    .then(async2)
    .then(logValue);
```
It is easy to see that first we call to `async1()`, then we call to `async2()` and at the end we call to `logValue()`. Naming functions with proper names will also make it easy to understand.   
All the previous examples with promises chaining were pretty optimistic since they all succeed. But in case a promise will be rejected for any reason, the chained promise will also rejected:
```javascript promises chaining example
// Let's imagine those are really asynchronous functions
function async1(value) {
    var deferred = $q.defer();
    var asyncCalculation = value * 2;
    deferred.resolve(asyncCalculation);
    return deferred.promise;
}
function async2(value) {
    var deferred = $q.defer();
    deferred.reject('rejected for demonstration!');
    return deferred.promise;
}

var promise = async1(10)
    .then(function(x) {
        return async2(x);
    });

promise.then(
    function(x) { console.log(x); },
    function(reason) { console.log('Error: ' + reason); });
```
As you can understand from this example, `Error: rejected for demonstration!` will be logged eventually.
***Promises also chain promises and resolved or rejected according to the chained promise, with it's resolve result or reject reason***.    

### Useful methods
`$q` has several helper methods that can be a great help when using promises. As I said before, other promises implementations have the same methods, probably with a different name.   
   
Sometimes we need to return a rejected promise. Instead of creating a new promise and rejecting it, we can use `$q.reject(reason)`. `$q.reject(reason)` returns a rejected promise with `reason`. Example:
```javascript $q.reject(reason) example
var promise = async().then(function(value) {
        if (isSatisfied(value)) {
            return value;
        } else {
            return $q.reject('value is not satisfied');
        }
    }, function(reason) {
        if (canRecovered(reason)) {
            return newPromiseOrValue;
        } else {
            return $q.reject(reason);
        }
    });
```
If `async()` resolved with a satisfied value, the value is chained and thus `promise` resolved with it. If the value is not satisfied a rejected promise is chained and `promise` will be rejected.
If `async()` rejected with a reason that can be recovered, the new value or promise is chained. If the reason cannot be recovered, a rejected promise is chained and eventually `promise` will be rejected.

Similar to `$q.reject(reason)`, sometimes we need to return a resolved promise with a value. Instead of creating a new promise and resolving it, we can use `$q.when(value)`.
```javascript using $q.when(value)
function getDataFromBackend(query) {
    var data = searchInCache(query);
    if (data) {
        return $q.when(data);
    } else {
        return makeAsyncBackendCall(query);
    }
}
```
In this example I wrote a function that should retrieve a data from my backend. But, before performing the backend call, the function searches the data in the cache. Since I want this function to return a promise, in case the data was found in the cache, the function returns `$q.when(data)`.   
A cool thing with `$q.when(value)` is that if `value` is a 3rd party thenable promise (like jQuery's Deferred), this method can wrap it and convert it into a $q promise. This way we can easily use other promises implementations with AngularJS.   
`$.ajax()` of jQuery, for example, returns such thenable promise. The following converts it into angular $q promise:
```javascript using $q.when(jQueryPromise)
var jQueryPromise = $.ajax({
    ...
    ...
    ...
});
var angularPromise = $q.when(jQueryPromise);
```

Sometimes we need to perform several asynchronous operations, no matter the order, and to get notified when they all done. `$q.all(promisesArr)` can help us with that. Assume we have `N` methods that return promises: `async1(), ..., asyncN()`. The following code will log `done` only when all operations resolved successfully:
```javascript $q.all(promisesArr) example
var allPromise = $q.all([
    async1(),
    async2(),
    ....
    ....
    asyncN()
]);

allPromise.then(function(values) {
    var value1 = values[0],
        value2 = values[1],
        ....
        ....
        valueN = values[N];

        console.log('done');
});
```
`$q.all(promisesArr)` returns a promise that is resolved only when all the promises in `promisesArr` resolved.
Keep in mind that if any of the promises will be rejected, the resulting promise will be rejected either.
---------------------------
## Promises tutorial using $q service
Here is the time to present some important methods of promises and deferrers along with practical tutorial.

Let's say we have an amazing application with an amazing registration form. In order to register, a user has to supply his current geolocation coordinates, his photo and his required username. To perform the registration action, our backend architecture requires the following from the frontend:   
    1. Provide geolocation longitude and latitude if possible.
    2. Upload the user photo to our photos storage server and provide a url of it.
    3. Reserve the username upon username selection and provide username reservation id.   
For supporting that, let's create the following simple functions (I decided to make this separation of functions in order to explain better). Look carefully and see that those methods are asynchronous and this is where promises come in:   

### Function that retrieves the current geolocation coordinates
```javascript getGeolocationCoordinates()
function getGeolocationCoordinates() {
    var deferred = $q.defer();
    navigator.geolocation.getCurrentPosition(
        function(position) { deferred.resolve(position.coords); },
        function(error) { deferred.resolve(null); }
    );
    return deferred.promise;
}
```
`getGeolocationCoordinates()` declares a deferred and then ask the browser for the current position. Since the geolocation coordinates are not mandatory, both the success and failure callbacks that are provided to `navigator.geolocation.getCurrentPosition()` are resolve the deferred with some result. In case of failure the result will be `null`. At the end the deferred's promise is returned.   

### Function that reads a local file and return it's content
```javascript readFile()
function readFile(fileBlob) {
    var deferred = $q.defer();
    var reader = new FileReader();
    reader.onload = function () { deferred.resolve(reader.result); };
    reader.onerror = function () { deferred.reject(); };
    try {
        reader.readAsDataURL(fileBlob);
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}
```
`readFile()` gets a file blob (the output of `&lt;input type="file"&gt;` field) and uses <a href="#" target="_blank">FileReader</a> to read it's content. Before reading the data and returning a promise, `readFile()` assigned `onload` and `onerror` callbacks that resolve and reject the deferred accordingly with the result. Notice that I decided to wrap `reader.readAsDataURL(fileBlob);` with `try {} catch() {}` block in order to handle run time exceptions. In case of an exception, the deferred is rejected.   

### Function that gets file content and uploads it to files storage
```javascript uploadFile()
function uploadFile(fileData) {
    var jQueryPromise = $.ajax({
        method: 'POST',
        url: '<endpoint for our files storage upload action>',
        data: fileData
    });

    return $q.when(jQueryPromise);
}
```
Since everyone knows jQuery, I decided to use <a href="#" target="_blank">`$.ajax`</a> in `uploadFile()`. `$.ajax` returns a promise, which is actually what we need. But, keep in mind that this promise is a jQuery's promise implementation and not `$q`. Fortunately, we have <a href="https://docs.angularjs.org/api/ng/service/$q#when" target="_blank">`$q.when(value)`</a> method. This method can wrap a 3rd party thenable promise into a $q promise. This way we can easily use other promises implementations with AngularJS.   
At the end, `uploadFile()` uses `$q.when(value)` and returns a promise.

### Function that reserves a username and returns the reservation id
```javascript reserveUsername()
function reserveUsername(username) {
    return $http.post('<endpoint for username reservation action>', {
        username: username
    }).$promise;
}
```
Here I used <a href="#" target="_blank">`$http`</a> service of AngularJS. `$http.post()` returns an object that contains a reference to a promise which indicates the post status. This promise created by the familiar `$q` service inside `$http.post()` and this will be the return value.   
   
Up to here we have learned how to create a deferred, how to reject and resolve it, how to get an access to it's promise and how to transform 3rd party thenable promise to AngularJS promise.   
Now that we have all the methods needed for registration, we can proceed with the registration implementation. Here we will see also how to interact with a promise.   

### Longitude and Latitude
Getting the longitude and the latitude is pretty easy. Here is a markup of two input elements. Notice that they are both bound to model and has a readonly attribute (I don't really want the user to enter values for longitude and latitude, the only way to set values on this field is by getting the geolocation from the device).
```html longitude the latitude inputs
<div>
    Longitude
    <input type="text" readonly="readonly" ng-model="data.coords.longitude" placeholder="No Longitude" />
</div>
<div>
    Latitude
    <input type="text" readonly="readonly" ng-model="data.coords.latitude" placeholder="No Latitude" />
</div>
```










registration form
1. fetch geolocation
2. read file and then upload the image
3. reserve username
4. credit card

### Creating a deferred - We want to create an asynchronic function that supports promises. First, we have to create a deferred.
```javascript Creating a deferred
function asyncFunc() {
    var deferred = $q.defer();
    ...
    ...
}
``` 
<---------CHANGE THIS TO BOTH REJECT AND RESOLVE!
### Resolving and rejecting deferred - Our asynchronic function can done it's action with success or failure. We can resolve the deferred with a result, which is an optional parameter.
```javascript Resolve a deferred
function asyncFunc() {
    ...
    ...
    deferred.resolve({ a: 42 });
    ...
}
```
### Rejecting a deferred - Our asynchronic function has failed. We can reject the deferred with a reason, which is an optional parameter. The reason can be in any type but it is better to keep it as a string.
```javascript Reject a deferred
function asyncFunc() {
    ...
    ...
    deferred.reject('Error: no permission!');
    ...
}
```
***Keep in mind, we can resolve or reject a deferred only once***

### Getting the promise - At the end of our function, we'll return the promise. This is a good practice since that way no external code can influence our deferred.
```javascript Return a promise
function asyncFunc() {
    ...
    ...
    return deferred.promise;
}
```
### Handle success and failure - After we've created our asynchronic function, let's call it and handle success and failure. We will do that using the `then(success, failure)` method of a promise, which gets success and failure callbacks as parameters and invoke one of them according to the result.   
```javascript Handle success and failure
var myPromise = asyncFunc();
myPromise.then(function(result) {
    console.log('success', result);
}, function(reason) {
    console.log('failure', reason);
});
```
Notice that you can call `then(success, failure)` more then once and whenever you want, as long as you have a reference to the promise. Both `success` and `failure` callbacks are optionals.
```javascript then(success, failure) usages
function getPosition() {
    var deferred = $q.defer();
    navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject);
    return deferred.promise;
}
```





I'll start with a basic example demonstrate how we can use a promise with the Geolocation api.
```javascript Use promise in Geolocation api
var deferred = $q.defer(); 
function success(position) {
  var coords = position.coords;
  console.log('Your current position is ' + coords.latitude + ' X ' + coords.longitude);
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

navigator.geolocation.getCurrentPosition(success, error);
``` 





<what is deferred>
<usage example>
<problems: sync two async operations, wait for async operations to complete>
<decorators for the help - what is decorator>
<decorate $q>





The result created only when the asynchronous operation completed its calculation, which might occur at any point in time, before or after the interaction with the promise.


something about "any time":
Initially, this result doesn't exist because the asynchronous method hadn't completed or even hadn't started yet.
A promise 
Promises provide a well-defined interface for interacting with an object that represents the result of an action that is performed asynchronously, and may or may not be finished at any given point in time.






* promise and deferred are related
* promise:
  1. provides an interface for interacting with deferred
  2. allows for interested parties to get access to the result of the deferred task when it completes

* deferred:
  1. represents the result of an asynchronous operation
  2. //acts as a proxy for a result of an asynchronous operation
  3. expose the associated Promise instance
  4. expose APIs that can be used for signaling the status of the task




**This might be a little complicate, but after some examples coming next everything will be clear.**   
A promise is an object that provides an interface for interacting with another related object called deferred. A deferred represents the result of an asynchronous operation. 




The purpose of the deferred object is to expose the associated Promise instance as well as APIs that can be used for signaling the successful or unsuccessful completion, as well as the status of the task.

The purpose of the promise object is to allow for interested parties to get access to the result of the deferred task when it completes.


A promise is an object that acts as a proxy for a result of an asynchronous operation.
Initially, this result doesn't exist because the asynchronous method hadn't completed or even hadn't started yet.
A promise 


Promises provide a well-defined interface for interacting with an object that represents the result of an action that is performed asynchronously, and may or may not be finished at any given point in time. By utilizing a standard interface, different components can return promises for asynchronous actions and consumers can utilize the promises in a predictable manner. Promises can also provide the fundamental entity to be leveraged for more syntactically convenient language-level extensions that assist with asynchronicity.


http://stackoverflow.com/questions/21141817/why-are-callbacks-more-tightly-coupled-than-promises
Second answer







 use <a href="https://docs.angularjs.org/api/auto/object/$provide#decorator" target="_blank">AngularJS decorator</a> in order to extend $q behavior to provide the promise state.



 This gets complicated when there is a need to synchronize several asynchronous operations:
```javascript synchronize several asynchronous operations using callbacks
asyncMethod1(function() {
    asyncMethod2(function() {
        asyncMethod3(function() {
            asyncMethod4();
        });
    });
});
```
 


A promise / deferred provides an interface for interacting with an object that represents the result of an asynchronous action. A promise object resolved or rejected according to the result of an asynchronous operation. One useful method of a promise is the `then(success, failure)` method which gets success and failure callbacks as parameters and invoke one of them according to the result.   
The problem described above can be easily solved using promises. The only thing we have to change in our asynchronous methods is to return a promise instead of getting a callback parameter. Then we can do:   
```javascript synchronize several asynchronous operations using promises
asyncMethod1().then(asyncMethod2).then(asyncMethod3).then(asyncMethod4);
```
And no more pyramid of doom.   

Nice thing about promises is that you don't have to provide success / failure callback to an asynchronous method in the time invoking it. You can later use the `then(success, failure)` method. For example:
```
var promise = asyncOperation();
...
...
... // bunch of code
...
...
// And than later
promise
    .then(function () {
        console.log('asyncOperation() succeeded');
    }, function () {
        console.log('asyncOperation() failed');
    });
```
`asyncOperation()` doesn't aware at all of what will happen upon success or failure. By the time we call `promise.then(...)`, the promise might be already resolved / rejected. In that case, the success / failure callback will invoked immediately. In case the promise is still waiting for `asyncOperation()` to complete, the success / failure callback will invoked on completion.   

As you can already understand, a promise maintain an internal state. This state is changes according to the asynchronous operation state. There are 3 states:   
 * `pending` - when the asynchronous operation is working
 * `fulfilled` - when the asynchronous operation completed successfully
 * `rejected` - when the asynchronous operation failed   

 ---------- WHAT ABOUT A STATE FOR NON STARTED PROMISE??? A PROMISE THAT IT'S ASYNC OPERATION DIDN'T STARTED YET???

AngularJS deferred lets us make asynchronous operations 

In light of apparent dislike for how I've attempted to answer the OP's question. The literal answer is, a promise is something shared w/ other objects, while a deferred should be kept private. Primarily, a deferred (which generally extends Promise) can resolve itself, while a promise might not be able to do so.



## AngularJS Promise implementation
AngularJS has promise implementation under a service provider named `$q`. $q is inspired by <a href="https://github.com/kriskowal/q" target="_blank">Kris Kowal's Q</a> implementation and has several important methods I'd like to write about, but first I would like to show some code:
```javascript deferred / promise example
function getGeoLocation() {
    var deferred = $q.defer();
    if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(function(position) {
            deferred.resolve(position);
        }, function(error) {
            deferred.reject(error);
        });
    } else {
        deferred.reject('geolocation api is not supported by the browser');
    }
    return deferred.promise;
}

var promise = getGeoLocation();
promise.then(function(position) {
    console.log('Your position is: ' + position);
}, function(reason) {
    console.log('Error: ' + reason); 
});

```
`getGeoLocation()` method responsible for getting geo location position. It gets no parameter and returns a promise. First, it creates a deferred object and verifies that geolocation api is supported by the browser. If the browser doesn't support geolocation api, `deferred.reject()` is called with a proper reason. Otherwise the method asks for the browser's geolocation. If the geolocation api fails, `deferred.reject()` is called with the failure reason. Otherwise `deferred.resolve()` is called with the position.   
Keep in mind that `getCurrentPosition()` is no synchronous and it get success and failure callbacks. When invoking `getGeoLocation()`, it returns a promise which represents a deferred object that can be resolved or rejected later. Whenever the deferred resolved with a position, the position is logged on the console. Whenever the deferred rejected with a reason, the reason logged on the console.   
As you can see, AngularJS makes a separation between a deferred and a promise. A deferred can be resolved or rejected and a promise holds the state and expose methods for handling the result. This way, an asynchronous operation can return a promise object which can't be changed by foreign code, and so keep the result safe (code that is not related to that operation doesn't have access to the deferred object and so can't reject or resolve it).  






First, we create a deferred. When we have a deferred object, we can call our asynchronous operation and then resolve or reject the deferred according to the result. A deferred has a property called `promise` that represents the deferred state. The promise contains the `then(success, failure)` method I mentioned before.

 has the  Unlike the deferred object, a promise is not able to resolve or reject the deferred.


Creating a deferred goes like this:
```javascript Creating a deferred

```

, but,  


 Let's write a function that 



AngularJS has separation between a deferred and a promise. Deferred is an object that responsible to the asynchronous operation. 

 while a promise is a property under an object that created by the deferred

* promise
Let's create a small usage example to `$q`. In this example I'll create a service that is responsible for saving a user. A user has, which does the following:
 * First, the service asks the backend for user id according to user name. If the user name is taken, the process failed.
 * When receiving the id, the service performs a user create request.
 * On success of failure, the service alerts the response to the user.
***This flow might feel non-trivial or even incorrect, but this is only for demonstration purposes.*** Notice that the create service consist of two asynchronous methods that need to be synchronized. Here is a version of using a callbacks:


A nice feature promise has is the ability 

 
One thing promises allow us to do is to synchronize several asynchronous operations very easily.   
For example, 




Although these are quick and easy they can really get over complicated producing a ever increasing indent to the code. This has the effect of making a pyramid like shape out of the whitespace when you turn it on it side:




 that is performed asynchronously, and may or may not be finished at any given point in time. 
Luckily, there is a relatively old pattern, called Promises (kind of similar to Future in Java) and a robust and modern implementation in jQuery core called $.Deferred that provides a simple and powerful solution to asynchronous programing.

To make it simple, the Promises pattern defines that the asynchronous API returns a Promise object which is kind of a “Promise that the result will be resolved with the corresponding data.” To get the resolution, the caller gets the Promise object and calls a done(successFunc(data)) which will tell the Promise object to call this successFunc when the “data” is resolved.


 implementation doesn't have a method to return the state.
