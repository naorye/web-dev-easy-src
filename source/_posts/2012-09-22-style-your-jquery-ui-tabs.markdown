---
comments: true
date: 2012-09-22 17:11:31
layout: post
slug: style-your-jquery-ui-tabs
title: Style Your jQuery-UI Tabs
wordpress_id: 77
categories:
- CSS and Style
tags:
- CSS
- jQuery
- jQuery-UI
- jQuery-UI-tabs
- Style
---


This article will explain and guide you step by step how to style your jQuery-UI tabs and make them look like this:   
![](http://www.webdeveasy.com/wp-content/uploads/2012/09/style-your-jquery-ui-tabs-sample.png)   
[Demo here](http://www.webdeveasy.com/demos/style-your-jquery-ui-tabs/style-tabs.htm).


<!-- more -->



For this example you will need [jQuery](http://www.jquery.com) and [jQuery-UI](http://www.jqueryui.com) for the [tabs plugin](http://jqueryui.com/demos/tabs/). There are many ways to use the tabs plugin and here I will use one of those methods.






	

## jQuery UI Tabs Markup


	The tabs plugin gets a parent element that contains an unordered list (<ul>). Each item (<li>) in the list represents a tab and contains an anchor (<a>) with a link to the data container div. For example:


    
    <div id="tabsContainer">
    	<ul>
    		<li><a href="#firstTab">First Tab<a/></li>
    		<li><a href="#secondTab">Second Tab<a/></li>
    		<li><a href="#thirdTab">Third Tab<a/></li>
    	</ul>
    	<div id="firstTab">
    		Content for the first tab
    	</div>
    	<div id="secondTab">
    		Content for the second tab
    	</div>
    	<div id="thirdTab">
    		Content for the third tab
    	</div>
    </div>



	As you can see the parent element ("div#tabsContainer") also contains the data containers. Each anchor has a reference to the id of the data container it represents. This way the tabs plugin knows for each tab which div to display.






	

## Our Tabs Markup


	This is our example's structure:

    
    <div id=quot;simpleTabsquot;>
    	<ul>
    		<li><a href="#facebook">Facebook</a></li>
    		<li><a href="#twitter">Twitter</a></li>
    		......
    		......
    	</ul>
    	<div id="facebook">
    		content about Facebook here 
    	</div>
    	<div id="twitter">
    		content about Twitter here
    	</div>
    	......
    	......
    </div>


	Because this is not the final markup, I summarized and didn't put the whole code. As you can see I created a parent div with unordered list and data containers in it. When running the tabs plugin on the code above I'll get regular tabs as you can see [here](http://www.webdeveasy.com/demos/style-your-jquery-ui-tabs/no-style-tabs.htm).
	When the tabs plugin generates the tabs, it makes manipulation on the DOM elements. After generating it, the DOM looks like this:


    
    <div class="ui-tabs ui-widget ui-widget-content ui-corner-all" id="simpleTabs">
    	<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
    		<li class="ui-state-default ui-corner-top ui-tabs-selected ui-state-active">
    			<a href="#facebook">Facebook</a>
    		</li>
    		<li class="ui-state-default ui-corner-top">
    			<a href="#twitter">Twitter</a>
    		</li>
    		......
    		......
    	</ul>
    	<div class="ui-tabs-panel ui-widget-content ui-corner-bottom" id="facebook">
    		content about Facebook here 
    	</div>
    	<div class="ui-tabs-panel ui-widget-content ui-corner-bottom" id="twitter">
    		content about Twitter here 
    	</div>
    	......
    	......
    </div>



	The tabs plugin added a few classes to the elements. This is something important to know and we use this when we change styles. Now we want each tab to contain an icon and a text. Therefore we will add a div inside each anchor and it will hold the text and the icon as a background image. Notice that HTML5 allows wrapping of block-level elements like <div>s with basic <a> element. Now, each list item looks like:
	
    
    <li><a href="#facebook"><div>Facebook</div></a></li>;








	

## Css and Tabs Style


	Now we are going to change the styles of our tabs. Our web application might use the tabs plugin more than once, and probably different tabs in our application will have different styles designs. For this reason we want to separate the design of the current tabs by adding a class to the parent element:
	
    
    <div id="tabsWithStyle" class="style-tabs">


	This way each tabs with the "style-tabs" class will share the same style and other tabs can have different styles.
	As we saw before, the tabs plugin has changed the DOM and added some classes. Those classes and syles are defined in the jQuery-UI css file and in order to change the appearance of our tabs we need to change them. Changing the original jQuery-UI css file might distort the page since those classes are used in many ways and in many other jQuery-UI plugins. In addition, changing the original css file will prevent replacing the jQuery-UI theme because the changes might get lost. Therfore the changes will be made in our style.css file.
	Remember the wrapper divs we added inside each anchor? Now is the time to give them background. Each div will get an "icon" class that defines width and font and maniplates the positions of the text and the icon image:
    
    
    .style-tabs.ui-tabs .ui-tabs-nav li .icon { 
    	color: #787878; background-position: center 3px; padding-top: 40px;
    	font-weight: bold; font-size: 12px; text-align: center; width: 80px;
    }


	In addition, each tab's div has a different icon image and therefore a different icon image class.






	

## Complete CSS File



    
    .facebook-icon { background: url(images/facebook.png) no-repeat; height: 32px; width: 32px; }
    .twitter-icon { background: url(images/twitter1.png) no-repeat; height: 32px; width: 32px; }
    .linkedin-icon { background: url(images/linkedin.png) no-repeat; height: 32px; width: 32px; }
    .google-icon { background: url(images/google.png) no-repeat; height: 32px; width: 32px; }
    .wikipedia-icon { background: url(images/wikipedia.png) no-repeat; height: 32px; width: 32px; }
    .picasa-icon { background: url(images/picasa.png) no-repeat; height: 32px; width: 32px; }
    
    .style-tabs.ui-widget-content { background: none; width: 480px; }
    .style-tabs.ui-tabs,
    .style-tabs.ui-tabs .ui-tabs-nav li a,
    .style-tabs.ui-tabs .ui-tabs-nav {
    	padding: 0;
    }
    .style-tabs.ui-tabs .ui-tabs-panel { padding: 5px; }
    .style-tabs.ui-tabs .ui-widget-header { 
    	border: none; background: url(images/TabMenu.png) repeat; height: 74px; width: 100%;
    }
    .style-tabs.ui-tabs .ui-corner-all { -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0; }
    .style-tabs.ui-tabs .ui-tabs-nav li { position: relative; height: 100%; cursor: pointer; margin: 0; top: 0; }
    .style-tabs.ui-tabs .ui-widget-header .ui-state-default { background: none; border: none; }
    .style-tabs.ui-tabs .ui-tabs-nav li.ui-tabs-selected,
    .style-tabs.ui-tabs .ui-tabs-nav li:hover {
    	background: url(images/SelectedMiddle.png) repeat;
    }
    .style-tabs.ui-tabs .ui-tabs-nav li .icon {
    	color: #787878; background-position: center 3px; padding-top: 40px;
    	font-weight: bold; font-size: 12px; text-align: center; width: 80px;
    }
    .style-tabs.ui-tabs .ui-tabs-nav li.ui-tabs-selected .icon,
    .style-tabs.ui-tabs .ui-tabs-nav li:hover .icon { 
    	color: #414141;
    }
    .style-tabs.ui-tabs .ui-tabs-nav li.ui-tabs-selected .icon:before,
    .style-tabs.ui-tabs .ui-tabs-nav li:hover .icon:before {
    	content: url(images/SelectedSides.png); position: absolute; right: 0; top: 0;
    }
    .style-tabs.ui-tabs .ui-tabs-nav li.ui-tabs-selected .icon:after,
    .style-tabs.ui-tabs .ui-tabs-nav li:hover .icon:after {
    	content: url(images/SelectedSides.png); position: absolute; left: 0; top: 0;
    }
    .style-tabs.ui-tabs .ui-tabs-nav li.ui-tabs-selected a { cursor: pointer; }



        Notice that those classes are based on the generated markup and this is how I know which classes to change. Among the changes, those styles also:
    


	
  1. Set fixed width to the tabs container.

	
  2. Define tab hover style to look like selected tab.

	
  3. Use the ":before" and ":after" [pseudo elements](http://www.w3schools.com/css/css_pseudo_elements.asp) in order to put an image before and after selected tab.








	

## Complete Markup:



    
    <!doctype html>
    <html>
    	<head> 
    		<title>www.webdeveasy.com example - Style Your jQuery-UI tabs</title>		
    		<script type="text/javascript" src="js/jquery-1.8.0.min.js"></script>
    		<script type="text/javascript" src="js/js/jquery-ui-1.8.23.custom.min.js"></script>
    		<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.8.23.custom.css" />
    		<link rel="stylesheet" type="text/css" href="css/style.css" />
    	</head>
    	<body>
    		<div id="tabsWithStyle" class="style-tabs">
    			<ul>
    				<li><a href="#facebook"><div class="icon facebook-icon">Facebook</div></a></li>
    				<li><a href="#twitter"><div class="icon twitter-icon">Twitter</div></a></li>
    				<li><a href="#linkedin"><div class="icon linkedin-icon">LinkedIn</div></a></li>
    				<li><a href="#google"><div class="icon google-icon">GooglePlus</div></a></li>
    				<li><a href="#wikipedia"><div class="icon wikipedia-icon">Wikipedia</div></a></li>
    				<li><a href="#picasa"><div class="icon picasa-icon">Picasa</div></a></li>
    			</ul>
    			<div id="facebook">
    				content about Facebook here 
    			</div>
    			<div id="twitter">
    				content about Twitter here
    			</div>
    			<div id="linkedin">
    				content about LinkedIn here
    			</div>
    			<div id="google">
    				content about Google Plus here
    			</div>
    			<div id="wikipedia">
    				content about Wikipedia here
    			</div>
    			<div id="picasa">
    				content about Picasa here
    			</div>
    		</div>
    		<script type="text/javascript">
    			$(function() {
    				$('#tabsWithStyle').tabs();
    			});
    		</script>
    	</body>
    </html>






That's all! have fun and don't hesitate to leave your comment!

Source files to download [here](http://www.webdeveasy.com/demos/style-your-jquery-ui-tabs/style-jquery-ui-tabs.zip).
