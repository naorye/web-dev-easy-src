---
comments: true
date: 2012-09-22 17:11:31
layout: post
slug: style-your-jquery-ui-tabs
title: Style Your jQuery-UI Tabs
spot: jquery
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
<iframe src="/code/style-your-jquery-ui-tabs/style-tabs.html" width="100%"></iframe>
<!-- more -->

For this example you will need <a href="http://www.jquery.com" target="_blank">jQuery</a> and <a href="http://www.jqueryui.com" target="_blank">jQuery-UI</a> for the <a href="http://jqueryui.com/demos/tabs/" target="_blank">tabs plugin</a>. There are many ways to use the tabs plugin and here I will use one of those methods.

jQuery UI Tabs Markup
---------------------

The tabs plugin gets a parent element that contains an unordered list (&lt;ul&gt;). Each item in the list (&lt;li&gt;) represents a tab and contains an anchor (&lt;a&gt;) with a link to the data container div. For example:

```html Tabs plugin structure
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
```

As you can see the parent element ("div#tabsContainer") also contains the data containers. Each anchor has a reference to the id of the data container it represents. This way the tabs plugin knows for each tab which div to display.

Our Tabs Markup
---------------

This is our example's structure:

```html Our example's structure
<div id="simpleTabs">
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
```

Because this is not the final markup, I summarized and didn't put the whole code. As you can see I created a parent div with unordered list and data containers in it. When running the tabs plugin on the code above I'll get regular tabs as you can see:
<iframe src="../code/style-your-jquery-ui-tabs/no-style-tabs.html" width="100%"></iframe>
When the tabs plugin generates the tabs, it makes manipulation on the HTML elements. After generating it, the HTML looks like similar to this:

```html After applying tabs plugin
<div id="simpaleTabs" class="ui-tabs ui-widget ui-widget-content ui-corner-all">
    <ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
        <li class="ui-state-default ui-corner-top ui-tabs-active ui-state-active">
            <a href="#facebook" class="ui-tabs-anchor">Facebook</a>
        </li>
        <li class="ui-state-default ui-corner-top">
            <a href="#twitter" class="ui-tabs-anchor">Twitter</a>
        </li>
        ......
        ......
    </ul>
    <div id="facebook" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
        content about Facebook here 
    </div>
    <div id="twitter" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
        content about Twitter here
    </div>
</div>
```

The tabs plugin added a few classes to the elements. This is something important to know and we use this when we change styles. Now we want each tab to contain an icon and a text. Therefore we will add a div inside each anchor and it will hold the text and the icon as a background image. Notice that HTML5 allows wrapping of block-level elements like &lt;div&gt;s with basic &lt;a&gt; element. Now, each list item looks like:
	
```html List item new look
<li><a href="#facebook"><div>Facebook</div></a></li>;
```

Css and Tabs Style
------------------

Now we are going to change the styles of our tabs. Our web application might use the tabs plugin more than once, and probably different tabs in our application will have different styles designs. For this reason we want to separate the design of the current tabs by adding a class to the parent element:
	
```html Add class to the parent element
<div id="tabsWithStyle" class="style-tabs">
```

This way each tabs with the "style-tabs" class will share the same style and other tabs can have different styles.   

As we saw before, the tabs plugin has changed the HTML and added some classes. Those classes and styles are defined in the jQuery-UI css file and in order to change the appearance of our tabs we need to change them. Changing the original jQuery-UI css file might distort the page since those classes are used in many ways and in many other jQuery-UI plugins. In addition, changing the original css file will prevent replacing the jQuery-UI theme because the changes might get lost. Therfore the changes will be made in our style.css file.

Remember the wrapper divs we added inside each anchor? Now is the time to give them background. Each div will get an "icon" class that defines width and font and maniplates the positions of the text and the icon image:
    
```css icon div style
.style-tabs .ui-tabs-nav li .icon { 
    color: #787878;
    background-position: center 3px;
    padding-top: 40px;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    width: 80px;
}
```

In addition, each tab's div has a different icon image and therefore a different icon image class.

Complete CSS File
-----------------

{% include_code lang:css Tabs Style style-your-jquery-ui-tabs/style.css %}

Notice that those classes are based on the generated markup and this is how I know which classes to change. Among the changes, those styles also:

* Set fixed width to the tabs container
* Define tab hover style to look like selected tab
* Use the ":before" and ":after" <a href="https://developer.mozilla.org/en-US/docs/CSS/Pseudo-elements" target="_blank">pseudo elements</a> in order to put an image before and after selected tab

Complete Markup
---------------

{% include_code lang:css Tabs Style style-your-jquery-ui-tabs/style-tabs.html %}

Demo & Download
---------------
* You can find a demo on the top of this article.
* <a href="../code/style-your-jquery-ui-tabs/style-your-jquery-ui-tabs.zip" target="_blank">You can download the code here</a>.

That's all! have fun and don't hesitate to leave your comment!
