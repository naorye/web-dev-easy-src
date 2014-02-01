---
comments: true
date: 2013-08-05 23:37:31
layout: post
slug: pages-slider-with-javascript-and-css
title: Pages Slider With JavaScript And CSS
spot: webdevelopment
categories:
- CSS
- JavaScript
tags:
- CSS
- jQuery
- Hammer.JS
- iPhone
inline-head: |
    <style>
        .example {
            text-align: center;
            margin-bottom: 1.5em;
        }
        .slider {
            display: inline-block;
        }
        .slider .page {
            width: 300px;
            height: 100px;  
            border-radius: 2px;
            box-shadow: inset 0 0 6px 0 rgba(0,0,0,0.4);
            background-repeat: no-repeat;
            background-size: cover;
        }
        .slider .page:nth-child(1) {
            background-image: url('http://www.lorempixum.com/300/100/?1');
        }
        .slider .page:nth-child(2) {
            background-image: url('http://www.lorempixum.com/300/100/?2');
        }
        .slider .page:nth-child(3) {
            background-image: url('http://www.lorempixum.com/300/100/?3');
        }
        .slider .page:nth-child(4) {
            background-image: url('http://www.lorempixum.com/300/100/?4');
        }
        .slider .page:nth-child(5) {
            background-image: url('http://www.lorempixum.com/300/100/?5');
        }
        .slider .page:nth-child(6) {
            background-image: url('http://www.lorempixum.com/300/100/?6');
        }
        .slider .page:nth-child(7) {
            background-image: url('http://www.lorempixum.com/300/100/?7');
        }
        .slider .page:nth-child(8) {
            background-image: url('http://www.lorempixum.com/300/100/?8');
        }
    </style>
    <link rel="stylesheet" href="/code/pages-slider-with-javascript-and-css/slider.css" type="text/css"/>
    <script type="text/javascript" src="/code/assets/js/hammer.js"></script>
    <script type="text/javascript" src="/code/pages-slider-with-javascript-and-css/slider-touch.js"></script>
---

In this article I will show you how to build a pages slider that looks like those on our smartphones. At the end we will get this:
<div class="example">
    Slide left to see this in action:
    <br/> 
    <div class="slider">
        <div class="content">
            <div class="page"></div>
            <div class="page"></div>
            <div class="page"></div>
            <div class="page"></div>
            <div class="page"></div>
            <div class="page"></div>
            <div class="page"></div>
            <div class="page"></div>
        </div>
    </div>
</div>
<script type="text/javascript">
    $(function() {
        $('.slider').pagesSliderTouch();
    });
</script>
<!-- more -->

Slider Markup Structure
-----------------------
Our slider consist of div contained in another div. The parent div has limited width with overflow set to "hidden". The child div contains the pages and therefore has their total width. This way only one page is visible and in order to move between pages all we have to do is change the child div's position relative to its parent. Important thing to mention is that we won't really change the child div's position property but will use CSS transform property to simulate this. Here is a sketch of the slider markup structure:

{% img center /code/pages-slider-with-javascript-and-css/images/markup.png 'Slider Markup Structure' %}   

According to this plan, let's write a markup for four pages with relevant CSS properties:
```html Pages slider plugin markup
<div class="slider">
	<div class="content">
        <div class="page"></div>
        <div class="page"></div>
        <div class="page"></div>
        <div class="page"></div>
    </div>
</div>
```
```css Slider plugin style
.slider { overflow: hidden; }
.slider .content { position: relative; }
.slider .content .page { float: left; }
```
This CSS is mandatory in order to give our slider the correct appearance. In addition, we have to style the pages. Their style is not mandatory for the plugin behavior and it's only purpose is to make the pages look nice. 
```css Pages style
.page {
    width: 300px;
    height: 100px;  
    border-radius: 2px;
    box-shadow: inset 0 0 6px 0 rgba(0,0,0,0.4);
    background-repeat: no-repeat;
    background-size: cover;
}

.page:nth-child(1) {
    background-image: url('http://www.lorempixum.com/300/100/?1');
}
.page:nth-child(2) {
    background-image: url('http://www.lorempixum.com/300/100/?2');
}
.page:nth-child(3) {
    background-image: url('http://www.lorempixum.com/300/100/?3');
}
.page:nth-child(4) {
    background-image: url('http://www.lorempixum.com/300/100/?4');
}
```
Keep in mind that all the pages must have equal width. In our example, page size is 300px width and 100px height. In order to make this example interesting, each page contains a random image.   
Now all we are left to do is writing the plugin's behavior. 

Slider Behavior
---------------
Our slider behavior is very simple. All we have to do is to bind to mouse down, mouse move and mouse up events, and move the pages accordingly.   
I will start to write this plugin with prototype, so if you are not familiar with prototype, my <a href="/javascript-prototype" target="_blank">JavaScript Prototype</a> article can be a good reference. Later I will integrate the plugin to jQuery plugin but you can easily integrate it yourself to an AngularJS directive or whatever you like. At the end I will integrate the plugin with <a href="http://eightmedia.github.io/hammer.js" target="_blank">Hammer.js</a> so the plugin will work also with touch gestures.   
Ok, enough talking. Let's write our plugin. 

## PagesSlider Initialization and Events Binding ##
```javascript PagesSlider initialization and events binding
var PagesSlider = function (slider, options) {
    this.slider = slider;
    this.content = slider.children().first();
    this.currentIndex = 0;
    this.pages = this.content.children();
    this.slider.width(this.pages.first().width());

    var totalWidth = 0;
    this.pages.each(function (index, page) {
        totalWidth += $(page).width();
    });
    this.content.width(totalWidth);

    this.bindEvents();
};
$.extend(PagesSlider.prototype, {
    bindEvents: function () {
        this._removeTransition = $.proxy(this.removeTransition, this);
        this._startDrag = $.proxy(this.startDrag, this);
        this._doDrag = $.proxy(this.doDrag, this);
        this._endDrag = $.proxy(this.endDrag, this);

        this.content
            .on('mousedown', this._startDrag)
            .on('transitionend', this._removeTransition);
        $('body')
            .on('mousemove', this._doDrag)
            .on('mouseup', this._endDrag);
    },
    destroy: function () {
        this.content
            .off('mousedown', this._startDrag)
            .off('transitionend', this._removeTransition);
        $('body')
            .off('mousemove', this._doDrag)
            .off('mouseup', this._endDrag);
    }
    .
    .
    .
});
```
Our constructor gets the slider element as an input. It sets the slider's width to be equal to the first page width and sets content's width to be equal to the pages widths sum. Since all the pages should have the same width and since slider's overflow CSS property was set to hidden, only one page will be visible. The page that will be visible is depending on the content's offset relative to slider.   
## startDrag(), doDrag(), endDrag() and removeTransition() ##
At the end of the constructor method we bind to 'mousedown', 'mousemove', 'mouseup' and 'transitionend' events. Let's see the implementation of startDrag(), doDrag(), endDrag() and removeTransition():
```javascript startDrag(), doDrag(), endDrag() and removeTransition() implementation
$.extend(PagesSlider.prototype, {
    .
    .
    .
    startDrag: function (event) {
        this.enableDrag = true;
        this.dragStartX = event.clientX;
    },
    doDrag: function (event) {
        if (this.enableDrag) {
            var position = this.pages.eq(this.currentIndex).position();
            var delta = event.clientX - this.dragStartX;

            this.content.css('transform', 'translate3d(' + (delta - position.left) + 'px, 0, 0)');
            event.preventDefault();
        }
    },
    endDrag: function (event) {
        if (this.enableDrag) {
            this.enableDrag = false;

            var delta = event.clientX - this.dragStartX;
            if (Math.abs(delta) > this.slider.width() / 5) {
                if (delta < 0) {
                    this.next();
                } else {
                    this.prev();
                }
            } else {
                this.current();
            }
        }
    },
    removeTransition: function() {
        this.content.css('transition', 'none');
    }
    .
    .
    .
});
```
On startDrag() we enable dragging and store the current X position in order to calculate dragging delta.   
On doDrag() we validate that dragging is enabled (mouse is down) and then calculate the delta and transform the content strip's position according to the delta.   
On endDrag() we disable dragging and move to the new page (previous, next or center the current page).   
The endDrag() method uses next(), prev() and current() methods in order to center the relevant page. Those methods are using CSS animation in order to make smoother transitions. Later, when we use mouse for dragging, we don't need that animation. Therefore, after the transition ends, we remove the animation using removeTransition() method.

## next(), prev() and current() ##
```javascript next(), prev() and current() implementation
$.extend(PagesSlider.prototype, {
    .
    .
    .
    goToIndex: function (index) {
        var position = this.pages.eq(index).position();

        this.content
            .css('transition', 'all 400ms ease')
            .css('transform', 'translate3d(' + (-1 * (position.left)) + 'px, 0, 0)');

        this.currentIndex = index;
    },
    current: function () {
        this.goToIndex(this.currentIndex);
    },
    next: function () {
        if (this.currentIndex >= this.pages.length - 1) {
            this.current();
        } else {
            this.goToIndex(this.currentIndex + 1);
        }
    },
    prev: function () {
        if (this.currentIndex <= 0) {
            this.current();
        } else {
            this.goToIndex(this.currentIndex - 1);
        }
    }
});
```
The last methods of the plugin are obvious. goToIndex() is a central method that gets a page index and makes a transition to that page. next(), prev() and current() validates that the new page's index is possible (for example, the index cannot be less than 0) and uses goToIndex() to make a transition to the new page.   
   
That's it! Pretty simple.

Integrate with jQuery Plugin
----------------------------
Now that we have the plugin code, integrating it into jQuery plugin is not a big deal. If you are not familiar with the <a href="/jquery-plugin-pattern" target="_blank">jQuery plugin pattern</a>, I advice you to read <a href="/jquery-plugin-pattern" target="_blank">this post</a>.   
```javascript jQuery plugin integration
(function($) {
    $.fn.pagesSlider = function(options) {
        this.each(function(index, slider) {
            var $this = $(slider);
            var pagesSlider = new PagesSlider($this);
            $this.data('pagesSlider', pagesSlider);
        });
        return this;
    };
})(jQuery);
```
And in order to invoke the plugin:
```javascript jQuery plugin invocation
$(function() {
    $('.slider').pagesSlider();
});
```
Integrate with Hammer.js
------------------------
Hammer.js is a JavaScript library for multi-touch gestures. Although we don't need multi-touch support, we want our users to be able to slide between pages by touch.
Let's download Hammer.js jQuery plugin and initialize Hammer in the scope of the slider before calling the plugin:
```javascript Initialize Hammer.js
    $.fn.pagesSliderTouch = function(options) {
        this.hammer();
        this.each(function(index, slider) {
            ...
            ...
```
Now, all we have to do is to change the events binding to Hammer's events. Changing 'mousedown', 'mousemove' and 'mouseup' to 'dragstart', 'drag' and 'dragend' will do the job.   

Demo & Download
---------------
* <a href="../code/pages-slider-with-javascript-and-css/index.html" target="_blank">Here</a> you can find a demo page.
* <a href="../code/pages-slider-with-javascript-and-css/pages-slider-with-javascript-and-css.zip" target="_blank">Here</a> you can download the source code.

That's all! have fun and don't hesitate to leave your comments!