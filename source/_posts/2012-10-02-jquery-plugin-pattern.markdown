---
comments: true
date: 2012-10-02 20:07:46
layout: post
slug: jquery-plugin-pattern
title: jQuery Plugin Pattern
spot: jquery
wordpress_id: 128
categories:
- JavaScript
tags:
- JavaScript
- jQuery
- Plugins
---

jQuery plugin is an extension to jQuery that encapsulates an ability or visual behaveiour so that it can be used later and in many different parts in a web application. This article will explain the basics of jQuery plugin and guide you how to create a simple jQuery plugin.
<!-- more -->

Two jQuery Plugin Types
-----------------------
I distinguish between two types of of jQuery plugins:

**Plugin that works on element.** For example, a plugin that converts &lt;select&gt; element to an autocomplete. Such plugin is working on the select element. This kind of plugin is actually extention to the jQuery prototype (or $.fn):
```javascript Extention to $.fn
$.fn.myPlugin = function() {
	... //plugin content
}
```
Invocation of such plugins looks like:
```javascript Plugin invocation  
$('#my-elem').myPlugin();
```
**Plugin that doesn't work on element.** <a href="http://docs.jquery.com/Utilities" target="_blank">The utilities of jQuery</a> are good examples for such plugin. They are actually functions that located in the jQuery object (or $):
```javascript Extention to $
$.myPlugin = function() {
	... //plugin content
}
```
Invocation of such plugins looks like:
```javascript Plugin invocation 
$.myPlugin();
```

Both types of plugins can get data as input, make DOM manipulations, make calculations, let the user interact them and much more.

Limit The Scope
---------------
Usually when writing jQuery plugin (or any JavaScript code), it is a good idea to limit it's scope. This way you can prevent access to private variables and functions. In addition, using scopes may helping prevent naming conflicts. In order to limit the scope of jQuery plugin, wrap it with a function and invoke it. For example:

```javascript Plugin inside IIFE    
(function() {
	$.fn.myPlugin = function() {
		... //plugin content
	}
})();
```
This is called <a href="http://benalman.com/news/2010/11/immediately-invoked-function-expression/" target="_blank">Immediately-Invoked Function Expression (IIFE)</a>.

The Dollar Sign
---------------
The dollar sign ($) is a synonym to the jQuery library. It is shorter and look better then the "jQuery" word. Because of that, there are many other libraries that make a use with the dollar sign as a synonym. So, we have to be sure our plugin doesn't collide with other libraries. Therefore passing jQuery as a parameter to the IIFE is a best practice:
 
```javascript Passing jQuery as a parameter to the IIFE     
(function($) {
    $.fn.myPlugin = function() { // Here we sure $ is jQuery
    	... // Plugin content
    }
})(jQuery);
```

Plugin Parameters and Defaults
------------------------------
We can pass parameters to our plugin when calling it, for example:
```javascript Pass parameters to our plugin
$('#elem').myPlugin(param1, param2, param3);
```
But, sometimes our plugin will have a lot of parameters (for instance, <a href="http://www.trirand.com/blog/" target="_blank">jqGrid</a> plugin has more then 20 parameters) and some of them might be optionals. For this reason we wrap all the parameters in an object. For example, assume our plugin gets parameters "name", "address" and "color", we will define our plugin:
```javascript Define jQuery plugin with options
$.fn.myPlugin = function(options) { ... }
```
and for calling it:
```javascript Call jQuery plugin with options  
$('#elem').myPlugin({
	name: 'Naor',
	address: 'Jerusalem',
	color: 'Green'
});
```
This way the user can supply only the parameters he wants. But this leads to another problem. What if the plugin need the color parameter which wasn't supplied? The solution is simple. All we have to do is to make a defaults to the parameters:
```javascript Options with defaults
(function($) {
	$.fn.myPlugin = function(options) {
		options = $.extend({
			name: 'no-name',
			address: 'none',
			color: 'white'
		}, options);
		... // The rest of the plugin
	}
})(jQuery);
```
This way we support many options with optional parameters.   
In case we want to force the user pass some parameters, we can use the old way for the compulsory parameters and an "options" object for the optionals:

    
```javascript Compulsory and optionals parameters
// param1 is compulsory
$.fn.myPlugin = function(param1, options) { ... }
```

The *this* Expression
---------------------
Inside a plugin definition the *this* expression has a different meaning between the two plugin types. I'll explain the meaning of the *this* expression using examples:


###The *this* expression for plugins that do not work on an element###

{% include_code lang:javascript The "this" expression jquery-plugin-pattern/this-expression/this1.html %}

Notice that inside such plugin, *this* is equal to jQuery.
You can watch this example <a href="../code/jquery-plugin-pattern/this-expression/this1.html" target="_blank">here</a>.

###The *this* expression for plugins that do work on an element###

{% include_code lang:javascript The "this" expression jquery-plugin-pattern/this-expression/this2.html %}

Notice that *this* is a reference to the main element that the plugin works on. Sometimes, like in this example, the jQuery element represents more then one DOM element and we have to iterate each one of them in order to effect all of the DOM elements. In this example each DOM element is different element and so different treatment.
You can watch this example <a href="../code/jquery-plugin-pattern/this-expression/this2.html" target="_blank">here</a>.

jQuery Chaining Principal
-------------------------
**jQuery Chaining Principal is relevant only to plugins that do work on an element.**

Take this code for example:
```javascript jQuery without chaining
    $('#elem').addClass('active');
    $('#elem').val('some value');
    $('#elem').prop('disabled', true);
```
This code adds css class to an element, sets its value and disables it. Instead of three different lines of code we can write:
I believe you've seen this syntax before:
```javascript jQuery chaining
$('#elem').addClass('active').val('some value').prop('disabled', true);
```
This looks better, easier to understand and more effective (no need to search for '#elem' a few times). This is made possible due to the jQuery chaining principal. Each jQuery method or plugin returns the element or elements that it works on:

```javascript jQuery chaining principal    
(function($) {
    $.fn.myPlugin = function(options) {
        ...
        ...
        return this; // This line responsible for chaining
    }
})(jQuery);
```
Remember that inside the plugin scope, the *this* expression referenced to the element itself.

User Interface
--------------
Up to now we saw a plugin structure wrapped in IIFE, with $ as jQuery and with compulsory/optional parameters. We undertsood the *this* expression inside a plugin and saw the chaining principal in action. Now we need to see how to create an interface so the user can interact with the plugin. I'll do it separately for each plugin type.

###Plugin that doesn't work on element###
The first plugin doesn't work on element, it gets positions and a text as parameters and displays the text on the specified position:
```javascript float plugin
    (function($) {
    	$.float = function(posX, posY, text) {
    		$('<div>'+text+'</div>').appendTo('body').css({
    			left: posX,
    			top: posY,
    			position: 'absolute'
    		});
    	}	
    })(jQuery);
```
Now we want to allow the user to move the text to a new position and to remove it. Let's write methods:
```javascript changePosition() and remove() methods  
(function($) {
    function changePosition(elem, posX, posY) {
        elem.css({
            left: posX,
            top: posY
        });
    }
    
    function remove(elem) {
        elem.remove();
    }

    $.float = function(posX, posY, text) {
        $('<div>'+text+'</div>').appendTo('body').css({
            left: posX,
            top: posY,
            position: 'absolute'
        });
    }   
})(jQuery);
```
Notice that the user doesn't have an access to "changePosition" nor "remove" and he never holds the &lt;div&gt; element. So now we need to connect the user to the methods. In order to do it we make the "float" plugin return a "remote control" object:
```javascript jQuery plugin returns "remote control" object
(function($) {
	function changePosition(elem, posX, posY) {
		elem.css({
			left: posX,
			top: posY
		});
	}
	
	function remove(elem) {
		elem.remove();
	}

	$.float = function(posX, posY, text) {
		var elem = $('<div>'+text+'</div>').appendTo('body').css({
			left: posX,
			top: posY,
			position: 'absolute'
		});
		
		return {
			changePosition: function(posX, posY) {
				changePosition(elem, posX, posY);
			},
			remove: function() { remove(elem); }
		};
	}	
})(jQuery);
```
Now, whenever the user will invoke $.float(..) he will get a "remote control" object with the interface we want to provide, and in order to use it:
```javascript Interact with a plugin
var control = $.float('100px', '100px', 'Hello!');
control.changePosition('200px', '200px');
```
Live example for the float plugin you can find <a href="../code/jquery-plugin-pattern/float-plugin/float.html" target="_blank">here</a>.

###Plugin that does work on element###
The second plugin does work on element. It works on an &lt;input&gt; element and gets two parameters: &lt;ul&gt; selector and a number "N". Whenever the input's value changes, the &lt;ul&gt; gets filled with "N" items containing the value:

    
```javascript Compose plugin
(function($) {
	$.fn.compose = function(options) {
		options = $.extend({
			number: 2,
			ul: null
		}, options);
		
		this.change(function() {
			if (options.ul !== null) {
				var value = $(this).val();
				var ul = $(options.ul).empty();
				for(var i=0;i<options.number;i++) {
					ul.append('<li>' + value + '</li>')
				}			
			}
		});
		
		return this;
	}
})(jQuery);
```
Now we want to allow the user to change the number parameter "N". Again, let's write a method for changing the parameter:
```javascript setNumber() method
(function($) {
	$.fn.compose = function(options) {
		options = $.extend({
			number: 2,
			ul: null
		}, options);
		
		function setNumber(number) {
			options.number = number;
		}
		
		this.change(function() {
			if (options.ul !== null) {
				var value = $(this).val();
				var ul = $(options.ul).empty();
				for(var i=0;i<options.number;i++) {
					ul.append('<li>' + value + '</li>')
				}			
			}
		});
		
		return this;
	}
})(jQuery);
```
Like the former plugin example, the user doesn't have an access to "setNumber" method. Unlike the former plugin example, here we cannot return a "remote control" object. Due to jQuery chaining principal we have to return *this*. For solving this we use <a href="http://api.jquery.com/jQuery.data/" target="_blank">jQuery.data()</a> method. This method allows us attach key-value data to an element. For example, $('#elem').data('my-color', 'Green'); attaches the "my-color = Green" key-value to the element. In order to get the value of "my-color" all we have to do is: $('#elem').data('my-color') and we get "Green".
So we use the jQuery.data() method to attach the "remote control" object to the element, and as a key we use the name of the plugin "compose":
```javascript jQuery plugin returns "remote control" object
(function($) {
	$.fn.compose = function(options) {
		options = $.extend({
			number: 2,
			ul: null
		}, options);
		
		function setNumber(number) {
			options.number = number;
		}
		
		this.change(function() {
			if (options.ul !== null) {
				var value = $(this).val();
				var ul = $(options.ul).empty();
				for(var i=0;i<options.number;i++) {
					ul.append('<li>' + value + '</li>')
				}			
			}
		});
		
		this.data('compose', {
			setNumber: setNumber
		});
		
		return this;
	}
})(jQuery);
```
Now, in order to change the number:
```javascript Interact with a plugin
$('#elem').compose({
	number: 3,
	ul: '#ul'
});

$('#elem').data('compose').setNumber(8);
```
And then the input's value will appear 8 times.
Live example for the compose plugin you can find <a href="../code/jquery-plugin-pattern/compose-plugin/compose.html" target="_blank">here</a>.

Summary
-------
In this article I presented two jQuery plugin types and their structure (IIFE wrap and jQuery injection as $), I explained how to add compulsory and optional parameters, demonstrated the meaning of the *this* expression and described the jQuery chaining principal. At the end I also presented a way of letting the user interact the plugins.


### Template of plugin that does not work on an element ###
{% include_code lang:css Template of plugin that does not work on an element jquery-plugin-pattern/templates/plugin-template-1.js %}

### Template of plugin that does work on an element ###
{% include_code lang:css Template of plugin that does not work on an element jquery-plugin-pattern/templates/plugin-template-2.js %}

Demo & Download
---------------
* Live example for the float plugin you can find <a href="../code/jquery-plugin-pattern/float-plugin/float.html" target="_blank">here</a>.
* Live example for the compose plugin you can find <a href="../code/jquery-plugin-pattern/compose-plugin/compose.html" target="_blank">here</a>.
* <a href="../code/jquery-plugin-pattern/jquery-plugin-pattern.zip" target="_blank">Here</a> you can find all the examples of this post and the plugins templates.


I hope you find this post useful, and if you have any question, don't hesitate to ask!
