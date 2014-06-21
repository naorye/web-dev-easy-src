---
comments: true
date: 2014-04-30 09:42:02
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
<!-- 
As some of you might know, currently I am Spot.IM's Front End team leader. We are developing a social network of conversations. The chat bubble you can find in many websites around the web is the fruit of me and my team's hard work. -->

A promise / deferred is a very simple and powerful tool for asynchronous development. The CommonJS wiki lists <a href="http://wiki.commonjs.org/wiki/Promises" target="_blank">several implementation proposals for the promise pattern</a>. AngularJS has it's own promise implementation that was inspired by <a href="https://github.com/kriskowal/q" target="_blank">Kris Kowal's Q</a> implementation. In this article I'll introduce promises and provide useful tutorial about how to work with promises using AngularJS $q promise service.
<!-- more -->

## Promise / Deferred Motivation
In JavaScript, asynchronous methods usually use a callbacks in order to inform a success or a failure state. The Geolocation api requires success and failure callbacks in order to <a href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition" target="_blank">get the current location</a>:
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
XMLHttpRequest (<a href="https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest" target="_blank">used to perform ajax calls</a>) has `onreadystatechange` callback property that is called whenever the `readyState` attribute changes:
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
And here we get the famous <a href="http://javascriptjabber.com/001-jsj-asynchronous-programming/" target="_blank">callback pyramid of doom</a>. Although there are nicer ways to write this code (separate that waterfall into functions for example), this is really hard to maintain and read.
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

## What is a Promise / Deferred?
A deferred represents the result of an asynchronic operation. It exposes an interface that can be used for signaling the state and the result of the operation it represents. It also provides a way to get the associated promise instance.   
A promise provides an interface for interacting with it's related deferred, and so, allows for interested parties to get access to the state and the result of the deferred operation.   
When creating a deferred, it's state is `pending` and it doesn't have any result. When we `reject()` or `resolve()` the deferred, it changes it's state with or without a result. Still, we can get the associated promise immediately after creating a deferred and even assign interactions with it's future result. Those interactions will occur only after the deferred rejected or resolved.   

When it comes to coupling, by using promises we can easily create an asynchronic operation before even decide what's going next after resolve. This is why coupling is looser. An asynchronic operation doesn't have to know how it continues, it only has to signal when it is ready.   
While deferred has methods for changing the state of an operation, a promise exposes only methods needed to handle and figure out the state, but not methods that can change the state. This prevents from external code to interfere the progress or the state of an operation.    
There are several implementations for promises in different languages (JavaScript, JAVA, C++, Python and more) and frameworks (NodeJS, jQuery for JavaScript). Sometimes it called `Future`. AngularJS has a promise implementation under the `$q` service.   

## Promise / Deferred tutorial using $q service
Here is the time to present some important methods of promises and deferrers along with practical tutorial. As said before, there are several implementations of promises, and so, different implementations may have different usage. This section will use <a href="https://docs.angularjs.org/api/ng/service/$q" target="_blank">AngularJS implementation of promise</a> - the $q service.   

Let's say we have an amazing application with an amazing registration form. In order to register, a user has to supply his current geolocation coordinates, his photo and his required username. To perform the registration action, our backend architecture requires us the following:   
    1. Provide geolocation longitude and latitude.
    2. Upload the user photo to our photos storage server and provide a url of it.
    3. Reserve the username upon username selection and provide username reservation id.   
For supporting that, let's create the following simple functions (I decided to make this separation of functions in order to explain better):   
    1. Function that retrieves the current geolocation coordinates.
    2. Function that reads a local photo file and return it's content.
    3. Function that gets photo content and uploads it to our photos storage.
    4. Function that reserves a username and returns the reservation id.   
Look carefully and see that those methods are asynchronous and this is where promises come in.
```javascript Basic functions implementation
function getGeolocationCoordinates() {
    var deferred = $q.defer();
    navigator.geolocation.getCurrentPosition(
        function(position) { deferred.resolve(position.coords); },
        function(error) { deferred.reject(error); }
    );
    return deferred.promise;
}

function readPhoto(photoPath) {
    var deferred = $q.defer();
    var reader = new FileReader();
    reader.onload = function () { deferred.resolve(reader.result); };
    reader.onerror = function () { deferred.reject(reader.result); };
    reader.readAsDataURL(photoPath);
    return deferred.promise;
}

// Since everyone knows jQuery, I'll use $.ajax instead of $http service
function uploadPhoto(photoData) {
    var deferred = $q.defer();
    $.ajax({
        method: 'POST',
        url: '<endpoint for out photos storage upload action>',
        data: photoData
    })
    .success(function(response){
        deferred.resolve(response.url);
    })
    .error(function(response) {
        deferred.reject(response.error);
    });
    return deferred.promise;
}

// Now I'll use the $http service
function reserveUsername(username) {
    var deferred = $q.defer();
    $http.post('<endpoint for username reservation action>', { username: username})
        .then(
            function(response) { deferred.resolve(response.reservationId); },
            function(response) { deferred.reject(response.error); }
        );
    return deferred.promise;
}

```
// each method explanation
For each method we will create a new deferred that will be resolved upon success or rejected upon failure. Each function will return a promise.



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
