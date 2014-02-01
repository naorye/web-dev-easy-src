---
comments: true
date: 2013-10-26 13:45:02
layout: post
slug: flexbox-accordion
title: Flexbox Accordion
spot: css
categories:
- CSS
tags:
- Plugins
inline-head: |
    <style>
    /* Flex box define */
    .actions-list {
        display: -webkit-box;
        display: -webkit-inline-flex;
        display: -moz-inline-flex;
        display: -ms-inline-flexbox;
        display: inline-flex;  
    }

    .actions-list .action-item {
        -webkit-box-flex: 1;
        -webkit-flex: 1 1 auto;
        -moz-flex: 1 1 auto;
        -ms-flex: 1 1 auto;
        flex: 1 1 auto;

        -webkit-transition: all 300ms ease;
        -moz-transition: all 300ms ease;
        -o-transition: all 300ms ease;
        transition: all 300ms ease;

        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;

        overflow: hidden;
    }

    /* Design: widths, colors, borders, etc... */
    .actions-list {
        margin: 0;
        padding: 0;
    }
    .actions-list .action-item {
        font-family: Helvetica, Arial, sans-serif;
        font-weight: lighter;
        cursor: pointer;
        background-color: #66bbcc;
        border-left: 1px solid rgba(0, 0, 0, 0.2);
        color: #000000;
        padding-left: 52px;
        background-repeat: no-repeat;
        background-position: left 10px center;
        background-size: 32px;
        line-height: 52px;
        height: 52px;
        max-width: 50px;
    }
    .actions-list .action-item:hover {
        max-width: 150px;
        background-color: #ff9966;
        padding-right: 10px;
    }
    .actions-list .action-item:first-child {
        border: none;
    }

    .facebook {
        background-image: url(../code/assets/images/facebook.png);
    }
    .google {
        background-image: url(../code/assets/images/google.png);
    }
    .linkedin {
        background-image: url(../code/assets/images/linkedin.png);
    }
    .picasa {
        background-image: url(../code/assets/images/picasa.png);
    }
    .twitter {
        background-image: url(../code/assets/images/twitter.png);
    }
    .wikipedia {
        background-image: url(../code/assets/images/wikipedia.png);
    }
    .flexbox-accordion-container {
        text-align: center;
    }
    </style>
---

I have made a css accordion using flexbox and I like to share it. This is how it looks like:
<div class="flexbox-accordion-container">
    <ul class="actions-list">
        <li class="action-item facebook">
            Facebook
        </li>
        <li class="action-item google">
            GooglePlus
        </li>
        <li class="action-item linkedin">
            LinkedIn
        </li>
        <li class="action-item picasa">
            Picasa
        </li>
        <li class="action-item twitter">
            Twitter
        </li>
        <li class="action-item wikipedia">
            Wikipedia
        </li>
    </ul>
</div>
<!-- more -->
<br/>
The markup and the css are pretty simple. We have a list of items, where the list is flexbox container and each item is a flex element. After defining this, all left to do is to define sizes, colors and the styling of each item.   
Here is the code:
```html Flexbox accordion markup
<ul class="actions-list">
    <li class="action-item facebook">
        Facebook
    </li>
    <li class="action-item google">
        GooglePlus
    </li>
    <li class="action-item linkedin">
        LinkedIn
    </li>
    <li class="action-item picasa">
        Picasa
    </li>
    <li class="action-item twitter">
        Twitter
    </li>
    <li class="action-item wikipedia">
        Wikipedia
    </li>
</ul>
```
```css Flexbox accordion css
/* Flex box define */
.actions-list {
    display: -webkit-box;
    display: -webkit-inline-flex;
    display: -moz-inline-flex;
    display: -ms-inline-flexbox;
    display: inline-flex;  
}

.actions-list .action-item {
    -webkit-box-flex: 1;
    -webkit-flex: 1 1 auto;
    -moz-flex: 1 1 auto;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;

    -webkit-transition: all 300ms ease;
    -moz-transition: all 300ms ease;
    -o-transition: all 300ms ease;
    transition: all 300ms ease;

    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    overflow: hidden;
}

/* Design: widths, colors, borders, etc... */
.actions-list {
    margin: 0;
    padding: 0;
}
.actions-list .action-item {
    font-family: Helvetica, Arial, sans-serif;
    font-weight: lighter;
    cursor: pointer;
    background-color: #66bbcc;
    border-left: 1px solid rgba(0, 0, 0, 0.2);
    color: #000000;
    padding-left: 52px;
    background-repeat: no-repeat;
    background-position: left 10px center;
    background-size: 32px;
    line-height: 52px;
    height: 52px;
    max-width: 50px;
}
.actions-list .action-item:hover {
    max-width: 150px;
    background-color: #ff9966;
    padding-right: 10px;
}
.actions-list .action-item:first-child {
    border: none;
}

.facebook {
    background-image: url(http://www.webdeveasy.com/code/assets/images/facebook.png);
}
.google {
    background-image: url(http://www.webdeveasy.com/code/assets/images/google.png);
}
.linkedin {
    background-image: url(http://www.webdeveasy.com/code/assets/images/linkedin.png);
}
.picasa {
    background-image: url(http://www.webdeveasy.com/code/assets/images/picasa.png);
}
.twitter {
    background-image: url(http://www.webdeveasy.com/code/assets/images/twitter.png);
}
.wikipedia {
    background-image: url(http://www.webdeveasy.com/code/assets/images/wikipedia.png);
}
```

I hope you will find a good use for it.

NaorYe