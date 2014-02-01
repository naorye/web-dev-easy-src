---
layout: post
slug: object-oriented-programming-with-javascript
title: Object Oriented Programming with JavaScript
spot: javascript
date: 2013-03-18 23:01
comments: true
categories:
- Object Oriented Programming
- JavaScript
tags:
- Object Oriented Programming
- JavaScript
---

As we already know, JavaScript is an object oriented language. In this article we will see JavaScript example to <a href="http://en.wikipedia.org/wiki/Inheritance_%28object-oriented_programming%29" target="_blank">inheritance</a> and <a href="http://en.wikipedia.org/wiki/Polymorphism_in_object-oriented_programming" target="_blank">subtype polymorphism</a>.<!-- more -->
For solid base, I really recommend to read first about <a href="../javascript-prototype">JavaScript Prototype</a>.

Base Class
----------
Lets define an Animal class. First thing to do is to define it's constructor:
```javascript Animal constructor
var Animal = function() {
    this.color = "Pink";
}
```
Next, lets define Animal's methods:
```javascript Animal methods
Animal.prototype.run = function() {
    console.log("Wuuuuuuuuuuuuushhhhhh");
}
Animal.prototype.sleep = function() {
    console.log("ZZZzzzZZZzzzZZZzzzzzz...");
}
Animal.prototype.eat = function() {
    console.log("HmnmnmHmmnmnm..BURP");
}
```
An easy way to write this is to extend Animal.prototype (using <a href="http://api.jquery.com/jQuery.extend/" target="_blank">jQuery</a>, <a href="http://underscorejs.org/#extend" target="_blank">underscore</a> or your own implementation):
```javascript Animal methods using jQuery.extend
$.extend(Animal.prototype, {
    run: function() {
        console.log("Wuuuuuuuuuuuuushhhhhh");
    },
    sleep: function() {
        console.log("ZZZzzzZZZzzzZZZzzzzzz...");
    },
    eat: function() {
        console.log("HmnmnmHmmnmnm..BURP");
    }
});
```
Great, this looks better. Now we can create animals that can run, sleep and eat.

Sub Class - Inharitance
-----------------------
Lets create a Cat which is a sub class of an Animal. First create Cat's constructor:
```javascript Cat constructor
var Cat = function() {
    Animal.apply(this, arguments); // Call parent class constructor

    this.name = name;
    console.log("My name is " + this.name +
                " and my color is " + this.color);
}
```
Next, we want Cat to have Animal's methods, so we need something like:
```javascript Cat's prototype gets Animal's prototype
Cat.prototype = Animal.prototype;
```
But this code will cause a problem. Adding new methods to Cat's prototype will add those methods also to Animal (since Cat.prototype and Animal.prototype are now refrence to the same set of methods).   
There are a few ways to solve this problem:

<ol>
    <li>
        Use Object.create method that creates an object based on set of properties:

```javascript Using Object.create
Cat.prototype = Object.create(Animal.prototype);
```
    </li>
    <li>
        Use extend:

```javascript Using extend
$.extend(Cat.prototype, Animal.prototype);
```
    </li>
    <li>
        Dance a little:

```javascript Dancing
var sub = function() { };
sub.prototype = Animal.prototype;
Cat.prototype = new sub();
```
    </li>
</ol>
Lets add methods to Cat:
```javascript Add methods to Cat
$.extend(Cat.prototype, {
    drinkMilk: function() {
        consoloe.log("lplplplplplp");
    },
    fightOtherCat: function() {
        console.log("Mirrrrrrrccchhhhh");
    }
});
```
Finally, Cat definition looks like this:
```javascript Cat definition
var Cat = function() {
    Animal.apply(this, arguments);

    this.name = name;
    console.log("My name is " + this.name +
                " and my color is " + this.color);
}
Cat.prototype = Object.create(Animal.prototype);
$.extend(Cat.prototype, {
    drinkMilk: function() {
        console.log("lplplplplplp");
    },
    fightOtherCat: function() {
        console.log("Mirrrrrrrccchhhhh");
    }
});
```
So, meybe it will be easier to create inheritance helper:
```javascript Inheritance helper
function inherit(base, methods) {
    var sub = function() {
        base.apply(this, arguments); // Call base class constructor
        
        // Call sub class initialize method that will act like a constructor
        this.initialize.apply(this, arguments);
    };
    sub.prototype = Object.create(base.prototype);
    $.extend(sub.prototype, methods);
    return sub;
}
```
Now creating Cat using the new helper is really simple and clear:
```javascript Cat definition using our inheritance helper
var Cat = inherit(Animal, {
    initialize: function(name) {
        this.name = name;
        console.log("My name is " + this.name +
                    " and my color is " + this.color);
    },
    drinkMilk: function() {
        console.log("lplplplplplp");
    },
    fightOtherCat: function() {
        console.log("Mirrrrrrrccchhhhh");
    }
});
```

Sub Class - Subtype Polymorphism
--------------------------------
Since cats are purring when they sleep, lets override the sleep method:
```javascript Override base class method
var Cat = inherit(Animal, {
    ...
    ...
    ...
    sleep: function() {
        console.log("rrr...rrr...rrr...");
    }
});
```
But, what if after purring, cats getting sleep like any other animal?   
Lets call the Animal's sleep method right after purring:
```javascript Calling base class method
var Cat = inherit(Animal, {
    ...
    ...
    ...
    sleep: function() {
        console.log("rrr...rrr...rrr...");
        Animal.prototype.sleep();
    }
});
```
Now out cat will sleep like any other animal after purring a little.

Complete Code
-------------
Here is our complete code:
```javascript Complete code
function inherit(base, methods) {
    var sub = function() {
        base.apply(this, arguments); // Call base class constructor
        
        // Call sub class initialize method that will act like a constructor
        this.initialize.apply(this, arguments);
    };
    sub.prototype = Object.create(base.prototype);
    $.extend(sub.prototype, methods);
    return sub;
}

var Animal = function() {
    this.color = "Pink";
}
$.extend(Animal.prototype, {
    run: function() {
        console.log("Wuuuuuuuuuuuuushhhhhh");
    },
    sleep: function() {
        console.log("ZZZzzzZZZzzzZZZzzzzzz...");
    },
    eat: function() {
        console.log("HmnmnmHmmnmnm..BURP");
    }
});

var Cat = inherit(Animal, {
    initialize: function(name) {
        this.name = name;
        console.log("My name is " + this.name +
                    " and my color is " + this.color);
    },
    drinkMilk: function() {
        consoloe.log("lplplplplplp");
    },
    fightOtherCat: function() {
        console.log("Mirrrrrrrccchhhhh");
    },
    sleep: function() {
        console.log("rrr...rrr...rrr...");
        Animal.prototype.sleep();
    }
});
```

Usage
-----
Since I have a cat, I must create its virtual persona:
```javascript My virtual Mutzi
var mutzi = new Cat("Mutzi");
mutzi.run();
mutzi.fightOtherCat();
mutzi.sleep();
```
And of course, the result will appear on the console:
```
My name is Mutzi and my color is Pink
Wuuuuuuuuuuuuushhhhhh
Mirrrrrrrccchhhhh
rrr...rrr...rrr...
ZZZzzzZZZzzzZZZzzzzzz...
```

Summary
-------
In this article we created the Animal base class. Then we created the Cat sub class by inherit from Animal. Then we added new methods for Cat and at the end we overridden Animal's method and used the base class implementation in our implementation.

I hope you had fun reading this article!   
Any questions -> to me :)