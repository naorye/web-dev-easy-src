---
comments: true
date: 2013-10-07 17:12:43
layout: post
slug: easy-select-plugin
title: Easy Select Plugin
categories:
- JavaScript
tags:
- Plugins
- JavaScript
---

One day I was asked to add a text input component with an ability to choose a value from fixed list. After searching the web, I found several jQuery plugins that was able to solve my needs and much more. But, those components required many dependencies and weighed so much for my simple need. So I decided to write my own plugin. Easy Select requires jQuery only and takes 3kb minified (before gzip):
<iframe src="/code/easy-select-plugin/index.html" width="100%" height="110px" scrolling="no" style="overflow:hidden;margin-top:-20px;"></iframe>
<!-- more -->

See a <a href="/code/easy-select-plugin/demo/index.html" target="_blank">demo</a>.

## Getting Started
1. Download the plugin from <a href="https://github.com/naorye/easy-select/archive/master.zip" target="_blank">here</a>.
2. Add a reference to jquery.easy-select.js and easy-select.css in your page (located in `/dist` folder). You can use the minified version instead by using jquery.easy-select.min.js and easy-select.min.css.  
3. In order to use the plugin on text input element:
```html Text input element
<input type="text" class="my-input" />
```
```javascript easy-select usage
$('.my-input').easySelect({
    items: [
        1: 'Option 1',
        2: 'Option 2',
        3: 'Option 3'
    ]
});
```

## Options
Easy select has a few options:   

<h4 style="margin-bottom: 0;">items</h4>
Type: Array of objects  
Default: `[]`   
Array of items for the select box.

<h4 style="margin-bottom: 0;">idKey</h4>
Type: String   
Default: `id`   
The name of the attribute that represents the item id.

<h4 style="margin-bottom: 0;">textKey</h4>
Type: String   
Default: `text`   
The name of the attribute that represents the item text.

<h4 style="margin-bottom: 0;">onSelect</h4>
Type: Function   
Default: `null`   
A callback function that triggered every time a new item gets selected.

## Methods
Easy select has also a few useful methods. In order to use them you need to access the API object:
```javascript Accessing easy-select API object
$('.my-input').data('easySelect');
``` 
#### getValue()
In order to get the selectd text you can read the value of your text input. `getValue()` method returns the value (or id) of the selected item.
```javascript Usage example
$('.my-input').data('easySelect').getValue();
```

#### setItems()
`setItems()` method lets you change the items list during runtime. This method is useful when you want to load data asynchronously.
```javascript Usage example
$.get('url/to/data').done(function(items) {
    $('.my-input').data('easySelect').setItems(items);
});
```

#### destroy()
`destroy()` method destroys the plugin by removing unnecessary elements and unbinding events.
```javascript Usage example
$('.my-input').data('easySelect').destroy();
```
## Contributing

1. Visit our git repository: <a href="https://github.com/naorye/easy-select" target="_blank">https://github.com/naorye/easy-select</a>
2. Fork it!
3. Create your feature branch: `git checkout -b my-new-feature`
4. Make your changes on the `src` folder, never on the `dist` folder
5. You can use `grunt build` and `grunt preview` commands in order to see your changes on the demo
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin my-new-feature`
8. Submit a pull request

I hope some of you will find a good use for it.

NaorYe