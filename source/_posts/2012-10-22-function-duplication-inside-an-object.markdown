---
comments: true
date: 2012-10-22 14:31:25
layout: post
slug: function-duplication-inside-an-object
title: Function Duplication Inside an Object
wordpress_id: 147
categories:
- JavaScript
tags:
- JavaScript
- Object
- this
---

Assuming I have the following object:

    
    
    var opts = {
    	change: function() {
    		alert('selected');
    	},
    	select: function() {
    		alert('selected');
    	}
    };
    



This object has duplication of a function. Such scenario is common when the object represents an options for a plugin. In this particular plugin, whenever the user invoke the change and the select events, an alert will show up.
Let's try to find solution to this code duplication:




	
  * 
		

## Try 1 - Using this.change


		  

		
    
    
    			var opts = {
    				change: function() {
    					alert('selected');
    				},
    				select: this.change
    			};
    		


		This code will assign 'undefined' value in opts.select since 'this' doesn't represent the object itself but the context of the declaraion (probably 'window'). Thus invoking opts.select() will actually return:
		
    
    
    			TypeError: opts.select is not a function.
    		


	

	
  * 
		

## Try 2 - Using the opts itself


		
    
    
    			var opts = {
    				change: function() {
    					alert('selected');
    				},
    				select: opts.change
    			};
    		


		This code will throw this exception since opts not yet assigned:
		
    
    
    			TypeError: opts is undefined
    		


		First the object is created and then its value is assigned to opts.
	

	
  * 
		

## Try 3 - Using a function


		
    
    
    			var opts = {
    				change: function() {
    					alert('selected');
    				},
    				select: function() {
    					opts.change();
    				}
    			};
    		


		This code will work fine and opts.select() will show the alert, since at the invocation time of opts.select() the opts variable is already assigned.
	

	
  * 
		

## Try 4 - Separation


		This is my preferred solution for this.
		
    
    
    			function hanldeSelected() {
    				alert('selected');
    			}
    			var opts = {
    				change: hanldeSelected,
    				select: hanldeSelected
    			};
    		


		This code will work fine but we have to keep on mind that in case hanldeSelected() uses 'this', the result of its invocation will depend on the context. for example:
		
    
    
    			function hanldeSelected() {
    				alert(this === window);
    			}
    			var opts = {
    				change: hanldeSelected,
    				select: hanldeSelected
    			};
    			opts.change();     // This will alert 'false' since the context is opts
    			hanldeSelected(); // This will alert 'true' since the context is 'window'
    		


	



Hope this helps!
