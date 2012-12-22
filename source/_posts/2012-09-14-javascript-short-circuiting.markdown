---
comments: true
date: 2012-09-14 15:32:24
layout: post
slug: enhanced-usage-of-javascript-operators
title: Enhanced usage of JavaScript && and || Operators
wordpress_id: 6
categories:
- JavaScript
tags:
- JavaScript
---


Sometimes I need to use "if" statements just to be sure a variable is not "null":

    
    var a = getObj();
    
    //if "a" is not zero, not "null" and also defined, then do something.
    if (a) { 
        doSomething();
    }








Other times I need to use "if"s in order to assign non-"null" value into a variable:

    
    var a = getIdOrNull();
    var id = -1;
    
    //if "a" is not zero, not "null" and also defined, then set the id.
    //Otherwise keep it "-1".
    if (a) { 
        id = a;
    }








It appears that there is a way to shorten and optimize this code using the && and || operators, and it called ["short-circuiting"](http://en.wikipedia.org/wiki/Short-circuit_evaluation). The idea behind this lays in the way the JavaScript enging works. For the && operator, expressions are executed until the first "false" value. For the || operator, expressions are executed until the first "true" value. Another thing that helps us here is the fact that "null" and "undefined" are treated as "false" and other than that are treated as "true" (except zero).






Finally, the first case can be written as:

    
    a && doSomething();


This starts with "a" and if it's value is true (not zero, not "null" and also defined) the JS engine continues and executes doSomething().







The second case can be written as:

    
    var id = a || -1;


This starts with "a" and if it is false (zero, "null" or "undefined") the JS engine continues and set "-1" into the id variable.







This can make your JavaScript code shorter, cleaner and easier to understand.

