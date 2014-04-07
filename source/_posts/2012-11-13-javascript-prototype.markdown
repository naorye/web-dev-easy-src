---
comments: true
date: 2012-11-13 08:49:17
layout: post
slug: javascript-prototype
title: JavaScript Prototype
spot: javascript
wordpress_id: 159
categories:
- JavaScript
---

I bet you have seen the prototype keyword before. This prototype thing is very important to know and understand especially if you want to be an expert web developer. This article will explain you about it.
<!-- more -->

Prototype-Based Language
------------------------
This part might confuse you a little, but believe me, after some examples coming next everything will be clear. So, stop the chit chat and let's dive into the JavaScript engine!

JavaScript is an object oriented language, but unlike all the <a href="http://en.wikipedia.org/wiki/Class-based_programming" target="_blank">class-based languages</a> (C++, JAVA, C#, ...), JavaScript is <a href="http://en.wikipedia.org/wiki/Prototype-based_programming" target="_blank">prototype-based language</a>. In class-based languages, we write classes which can be organized into hierarchy and so advance code reuse. In prototype-based languages, there is no distinction between classes and objects. An object is used as a template for creating a new object. In addition, an object's set of properties can be extended either at creation time or at run time. This way prototype-based language furthering code reuse. There are more differences between class-based and prototype-based languages but this is enough for now.

Let's instantiate a new object. In order to do it we have to define function and then simply use the "new" keyword:
```javascript Instantiate a new object
    function baseObj(name) {
        this.sayHi = function() {
            alert("Hi " + this.name);
        }
        this.name = name;
    }
    var ins = new baseObj("Dan");
```
The baseObj() function is called Object Constructor since it creates and defines an object. Later we can call:
```javascript Hi Dan
    ins.sayHi(); // Alerts "Hi Dan"
```
We will talk about this later.

JavaScript's Prototype
----------------------
In JavaScript, as we mentioned before, we can add properties to an object even after its creation:
``` javascript Add properties to an object
    function animal(){
        ...
        ...
    }
    var cat = new animal();
    cat.color = "Green";
```
It is important to notice that the color property is added only to the cat instance. Other instances of animal will not contain the color property. But, there are times where we want to add a property to all the instances of an object. Each animal has a color and not only cats, therefore color property is relevant to all instances of animal. That's where the prototype object of JavaScript comes in.   

In JavaScript, each object has a property called "prototype". An object's prototype allows us adding properties to all instances of that object (even to the existing instances). For example:
```javascript Add the color property to all animal instances 
    var frog = new animal();
    console.log(frog.color); // frog doesn't have the color property yet
    
    animal.prototype.color = "Green";
    var dog = new animal();
    console.log(dog.color); // will log "Green"
    console.log(frog.color); // will also log "Green"
```
This adds and initialize the color property to every present and future animal instances.   

Similar to properties, we can add methods and reflects all the instances:
```javascript Add the color method to all instances
    animal.prototype.run = function() {
    	console.log("I am running!");
    }
    dog.run(); // will log "I am running!"
```
This functionality allows us to do very useful things like extending the behavior of an Array and add a method that gets an element and removes it from the array:
``` javascript Extend Array's functionality
    Array.prototype.remove = function(elem) {
    	var index = this.indexOf(elem);
    	if (index >= 0) {
    		this.splice(index, 1);
    	}
    }
    var arr = [1, 2, 3, 4, 5];
    arr.remove(4); // will keep the array to be [1, 2, 3, 5]
```
In this example I used the "this" keyword inside the method. Keep in mind that "this" refer to the object that calls the method. In this example when calling arr.remove(4), "this" refer to arr and therefore this.indexOf(elem) returns the index of elem in arr.

The Object Constructor Way
--------------------------
Besides the prototype approach, another way to define properties and methods is by doing it inside the object constructor:
```javascript Define properties and methods inside the object constructor
    function animal() {
    	this.color = "Green";
    	this.run = function() {
    		console.log("I am running!");
    	}
    }
    var mouse = new animal();
    mouse.run(); // will log "I am running!"
```
This code results the same object structure as the prototype approach. Each instance of animal will have the color property and the run method.   

The main advantage of this approach is that you can make a use of local variables defined inside the object constructor:
```javascript Use local variables inside an object constructor
    function animal() {
    	var runAlready = false;
    	this.color = "Green";
    	this.run = function() {
    		if (!runAlready) {
    			console.log("I am running!");
    		} else {
    			console.log("I am already running!");
    		}
    	}
    }
```
    
Those local variable "runAlready" is acting like private members of C# and JAVA. No one can access this variable except the object's methods.

This approach might seem more readable and convenient but actually is not always recommended, especially when adding many methods. If you don't need to use local variables defined inside the object constructor, then there is no reason to use this approach and using prototype is better. That is because if you are going to create lots of animals, a new set of methods will be created and held in different instances each time the animal constructor is called. In the prototype approach, all the instances will share one set of methods and therefore less memory.   

You can also use combine approaches whereby methods that uses private local constructor variables will be defined inside the constructor while other methods will be added using the prototype:
```javascript Combined approach for extend an object's functionality
    function animal() {
    	var runAlready = false;
    	this.run = function() {
    		if (!runAlready) {
    			console.log("I am running!");
    		} else {
    			console.log("I am already running!");
    		}
    	}
    }
    animal.prototype.color = "Green";
    animal.prototype.hide = function() {
    	console.log("I am hiding!");
    }
    
    var horse = new animal();
    horse.run(); // will log "I am running!"
    horse.hide(); // will log "I am hiding!"
```

Conclusion
----------
With this article we understood the meaning of prototype-based language, we saw how we can use the prototype property in order to add properties and methods to all instances of an object. We even saw a practical example of extending Array's behavior! :) I demonstrated another way to add properties using the object constructor and explained its drawback.   

If you wish to read more about the differences between class-based languages and prototype-based languages, dig in details about prototype and inheritance, I highly recommend to read Mozilla's <a href="https://developer.mozilla.org/en-US/docs/Core_JavaScript_1.5_Guide/Details_of_the_Object_Model" target="_blank">Details of the object model</a> guide.

I really enjoyed writing this article and I hope you enjoyed even more to read it.
