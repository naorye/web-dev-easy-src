---
comments: true
date: 2012-09-14 15:34:42
layout: post
slug: cascading-autocompletes-using-jquery-ui
title: Cascading Autocompletes using jQuery UI
wordpress_id: 8
categories:
- JavaScript
tags:
- Autocomplete
- JavaScript
- jQuery-UI
- Plugins
---

Yesterday I got a new requirement for the application I am working on.
I had several [jQuery UI autocompletes](http://jqueryui.com/demos/autocomplete) and I needed to add cascading functionality. This means that each autocomplete in the group affects the following autocomple's possible values. If there is no value selected in the first autocomplete - the next autocomplete must be disabled. When the user selects a value on the first autocomplete - the next autocomplete becomes enabled.
<!-- more -->

After searching the web I realized that the best option for me is to write my own jQuery plugin that manages the autocompletes cascading.
The plugin gets as input a sequence of jQuery UI auocomplete elements and adds the cascading functionality. The idea under my plugin is to override each autocomplete's change and select events, and enable or disable the next autocomplete in the sequence according to the selected value.

Here is the code:
{% include_code lang:javascript Cascading Autocompletes plugin cascading-autocompletes-plugin/jquery.cascading-autocompletes.js %}

Usage example:

``` javascript Cascading Autocompletes plugin Usage
    $.cascadingAutocompletes(["#country", "#city", "#street"]);
```

[Demo Here]({{ root_url }}/code/cascading-autocompletes-plugin/index.html).

Hope this helps!
