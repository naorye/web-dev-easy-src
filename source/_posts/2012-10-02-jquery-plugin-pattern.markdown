---
comments: true
date: 2012-10-02 20:07:46
layout: post
slug: jquery-plugin-pattern
title: jQuery Plugin Pattern
wordpress_id: 128
categories:
- JavaScript
tags:
- JavaScript
- jQuery
- Plugins
---

jQuery plugin is an extension to jQuery that encapsulates an ability or visual behaveiour so that it can be used later and in many different parts of your web application. This article will explain the basics of jQuery plugin and guide you how to create a simple jQuery plugin.

I distinguish between two types of of jQuery plugins:




  * Plugin that works on element. For example, a plugin that converts <select> element to an autocomplete. Such plugin is working on the select element. This kind of plugin is actually extention to the jQuery prototype (or $.fn):

    
    
    $.fn.myPlugin = function() {
    	... //plugin content
    }
    


 Invocation of such plugins looks like:

    
    
    $('#my-elem').myPlugin();
    



  * Plugin that doesn't work on element. [The utilities of jQuery](http://docs.jquery.com/Utilities) are good examples for such plugin. They are actually functions that located in the jQuery object (or $):

    
    
    $.myPlugin = function() {
    	... //plugin content
    }
    


Invocation of such plugins looks like:

    
    
    $.myPlugin();
    



Both types of plugins can get data as input, make DOM manipulation, make calculations, let the consumer interact them and much more.



## Limit The Scope


Usually when writing jQuery plugin (or any JavaScript code), it is a good idea to limit it's scope. This way you can prevent access to private variables and functions. In addition, using scopes may helping prevent naming conflicts. In order to limit the scope of your jQuery plugin, wrap it with a function and invoke it. For example:

    
    
    (function() {
    	$.fn.myPlugin = function() {
    		... //plugin content
    	}
    })();
    


This is called [Immediately-Invoked Function Expression (IIFE)](http://benalman.com/news/2010/11/immediately-invoked-function-expression/).



## The Dollar Sign


The dollar sign ($) is a synonym to the jQuery library. It is shorter and look better then the "jQuery" word. Because of that, there are many other libraries that make a use the dollar sign as a synonym. So, we have to be sure our plugin doesn't collide with other libraries. Therefore passing jQuery as a parameter to the IIFE is a best practice:

    
    
    (function($) {
    	$.fn.myPlugin = function() { // Here we sure $ is jQuery
    		... // Plugin content
    	}
    })(jQuery);
    





## Plugin Parameters and Defaults


We can pass parameters to our plugin when calling it:
$('#elem').myPlugin(param1, param2, param3);
But, sometimes our plugin will have a lot of parameters ([jqGrid](http://www.trirand.com/blog/) plugin has more then 20) and some of them might be optionals. For this reason we wrap all the parameters in an object. For example, assume our plugin gets parameters "name", "address" and "color", we will define our plugin:

    
    
    $.fn.myPlugin = function(options) { ... }
    


and for calling it:

    
    
    $('#elem').myPlugin( {
    	name: 'Naor',
    	address: 'Jerusalem',
    	color: 'Green'
    } );
    


This way the consumer can supply only the parameters she wants. But this leads to another problem. What if the plugin need the color parameter which wasn't supplied? The solution is simple. All we have to do is to make a defaults to the parameters:

    
    
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
    


This way we support many options with optional parameters. In case we want to force the consumer pass some parameters, we can use the old way for the compulsory parameters and an "options" object for the optionals:

    
    
    // param1 is compulsory
    $.fn.myPlugin = function(param1, options) { ... }
    





## The _this_ Expression


Inside a plugin definition there is a different meaning to the _this_ expression. There is a difference between the two plugin types and I will explain the meaning of the _this_ expression using examples:


### The _this_ Expression for plugins that do not work on an element



    
    
    ﻿<!doctype html>
    <html>
    	<head> 
    		<title>jQuery Plugins</title>
    		<script type="text/javascript" src="jquery-1.8.0.min.js"></script>
    		<script type="text/javascript">
    			(function($) {
    				$.myPlugin = function() {
    					// Here this represents the jQuery object
    					return $ === this;
    				};
    			})(jQuery);
    		</script>
    	</head>
    	<body>
    		Is <i>this</i> equals jQuery? <span id="isEqual" />
    		<script type="text/javascript">
    			$(function() {
    				$('#isEqual').text($.myPlugin());
    			});
    		</script>
    	</body>
    </html>
    


Notice that inside a plugin, _this_ is equal to jQuery.
You can watch this example [here](http://www.webdeveasy.com/demos/jquery-plugin-pattern/this1.htm).


### The _this_ Expression for plugins that do work on an element



    
    
    ﻿<!doctype html>
    <html>
    	<head> 
    		<title>jQuery Plugins</title>
    		<script type="text/javascript" src="jquery-1.8.0.min.js"></script>
    		<script type="text/javascript">
    			(function($) {
    				$.fn.myPlugin = function(text) {
    					// Here this is a reference to the actaul jQuery
    					// element the plugin works on.
    					this.each(function() {
    						var current = $(this);
    						var elemType = current.prop('tagName').toLowerCase();
    						switch(elemType)  {
    							case 'input':
    								current.val(text);
    								break;
    							case 'select':
    								current.empty().append('<option>' + text + '</option>');
    								break;
    							case 'span':
    								current.text(text);
    								break;
    						}
    
    					});
    				};
    			})(jQuery);
    		</script>
    	</head>
    	<body>
    		Choose text: <input type="text" id="my-text" />
    		<button id="my-button">Press here</button>
    		<br/>
    		Span: <span class="target"></span> <br/>
    		Text input: <input type="text" class="target" /> <br/>
    		Select: <select class="target"></select>
    		<script type="text/javascript">
    			$(function() {
    				$('#my-button').click(function() {
    					var text = $('#my-text').val();
    					$('.target').myPlugin(text);
    				});
    			});
    		</script>
    	</body>
    </html>
    


Notice that _this_ is a reference to the main element that the plugin works on. Sometimes, like in this example, the jQuery element represents more then one DOM element and we have to iterate each one of them in order to effect all of the DOM elements. In this example each DOM element is different element and so different treatment.
You can watch this example [here](http://www.webdeveasy.com/demos/jquery-plugin-pattern/this2.htm).



## jQuery Chaining Principal


**jQuery Chaining Principal is relevant only to plugins that do work on an element.**
I believe you've seen this syntax before:

    
    
    $('#elem').addClass('active').val('some value').prop('disabled', true);
    


Keep in mind that the consumer can actually write:

    
    
    $('#elem').addClass('active');
    $('#elem').val('some value');
    $('#elem').prop('disabled', true);
    


But the first syntax looks better, easier to understand and more effective (no need to search for '#elem' a few times). This is made possible due to the jQuery chaining principal. Each jQuery method or plugin returns the element that it works on:

    
    
    (function($) {
        $.fn.myPlugin = function(options) {
            ...
            ...
            <b>return this;</b>
        }
    })(jQuery);
    


Keep in mind that inside the plugin scope, the _this_ expression referenced to the element itself.



## Consumer interface


Up to now we saw a plugin structure wrapped in IIFE, with $ as jQuery and with compulsory/optional parameters. We undertsood the _this_ expression inside a plugin and saw the chaining principal in action. Now we need to see how to create an interface so the consumer can interact with the plugin. I'll do it separately for each plugin type.


### Plugin that doesn't work on element


The first plugin doesn't work on element, it gets positions and a text as parameters and displays the text on the specified position:

    
    
    (function($) {
    	$.float = function(posX, posY, text) {
    		$('<div>'+text+'</div>').appendTo('body').css({
    			left: posX,
    			top: posY,
    			position: 'absolute'
    		});
    	}	
    })(jQuery);
    


Now we want to allow the consumer to move the text to a new position and to remove it. Let's write a methods:

    
    
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
    


Notice that the consumer doesn't have an access to "changePosition" nor "remove" and she never holds the <div> element. So now we need to connect the consumer to the methods. In order to do it we make the "float" plugin return a "remote control" object:

    
    
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
    


Now, whenever the consumer will invoke $.float(..) she will get a "remote control" object with the interface we want to provide, and in order to use it:

    
    
    var control = $.float('100px', '100px', 'Hello!');
    control.changePosition('200px', '200px');
    


Live example for the float plugin you can find [here](http://www.webdeveasy.com/demos/jquery-plugin-pattern/float.htm).


### Plugin that does work on element


The second plugin does work on element. It works on an <input> element and gets two parameters: <ul> selector and a number "N". Whenever the input's value changes, the <ul> gets filled with "N" items containing the value:

    
    
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
    


Now we want to allow the consumer to change the number parameter. Again, let's write a method:

    
    
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
    


Like the first plugin type example, the consumer doesn't have an access to "setNumber" method. Unlike the first plugin type example, here we cannot return a "remote control" object. Due to jQuery chaining principal we have to return "this". For solve this we use the [jQuery.data()](http://api.jquery.com/jQuery.data/) method. This method allows us attach key-value data to an element. For example, $('#elem').data('my-color', 'Green'); attaches the "my-color = Green" key-value to the element. In order to get the value of "my-color" all we have to do is: $('#elem').data('obj') and we get "Green".
So we use the jQuery.data() method to attach the "remote control" object to the element. We will use the name of the plugin "compose" as a key:

    
    
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
    


Now, in order to change the number

    
    
    $('#elem').compose({
    	number: 3,
    	ul: '#ul'
    });
    
    $('#elem').data('compose').setNumber(8);
    


And then the input's value will appear 8 times.
Live example for the compose plugin you can find [here](http://www.webdeveasy.com/demos/jquery-plugin-pattern/compose.htm).



## Summary


In this article I presented two jQuery plugin types and their structure (IIFE wrap and jQuery injection as $), I explained how to add compulsory and optional parameters, demonstrated the meaning of the _this_ expression and described the jQuery chaining principal. At the end I also presented a way of letting the consumer interact the plugins.



### Template of plugin the does not work on an element



    
    
    (function($) {
    	$.extend($, {
    		pluginName: function(param, options) {
    			options = $.extend({
    				// Options Defaults
    			}, options);
    
    		
    			return {
    				// Plugin interface object
    			};
    		}
    	});		
    })(jQuery);
    




### Template of plugin the does work on an element



    
    
    // jQuery plugin template for plugin that does work on element
    (function($) {
    	$.extend($.fn, {
    		pluginName: function(param, options) {
    			options = $.extend({
    				// Options Defaults
    			}, options);
    
    			this.each(function() {
    				// Operations for each DOM element
    			}).data('pluginName', {
    				// Plugin interface object
    			});
    		
    			return this;
    		}
    	});		
    })(jQuery);
    



I hope you find this post useful, and if you have any question, don't hesitate to ask!
[Here](http://www.webdeveasy.com/demos/jquery-plugin-pattern/jquery-plugin-pattern.zip) you can find all the examples of this post and the plugins templates.
