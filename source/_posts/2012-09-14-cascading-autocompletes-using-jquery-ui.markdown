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

After searching the web I realized that the best option for me is to write my own jQuery plugin that manages the autocompletes cascading.
The plugin gets as input a sequence of jQuery UI auocomplete elements and adds the cascading functionality. The idea under my plugin is to override each autocomplete's change and select events, and enable or disable the next autocomplete in the sequence according to the selected value.

Here is the code:

    
    (function($) {
        $.fn.extend({
            cascade: function(child) {
                var parent = this;
                var isChildActivate = true;
    
                function activateChild() {
                    child
                        .prop('disabled', false)
                        .removeClass('disabled');
                    if (child.autocomplete) {
                        child.autocomplete('enable');
                    }
                    isChildActivate = true;
                }
    
                function deactivateChild() {
                    child
                        .prop('disabled', true)
                        .val('')
                        .addClass('disabled');
                    if (child.autocomplete) {
                        child.autocomplete('disable');
                    }
                    isChildActivate = false;
                }
    
                function eventOverride(originalEvent) {
                    return function(event, ui) {
                        if (ui.item == null && isChildActivate) {
                            deactivateChild();
                        } else if (ui.item != null && !isChildActivate) {
                            activateChild();
                        }
                        if (typeof originalEvent === 'function') {
                            originalEvent.apply(this, [event, ui]);
                        }
                    };
                }
    
                if (parent.autocomplete) {
                    var originalChange = parent.autocomplete('option', 'change');
                    var originalSelect = parent.autocomplete('option', 'select');
                    parent.autocomplete('option', 'change', eventOverride(originalChange));
    
                    parent.autocomplete('option', 'select', eventOverride(originalSelect));
                }
    
                deactivateChild();
    
                return parent;
            }
        });
        $.extend({
            cascadingAutocompletes: function(autocompletes) {
                for (var i = 0; i < autocompletes.length - 1; i++) {
                    var parent = $(autocompletes[i]);
                    var child = $(autocompletes[i + 1]);
                    if (autocompletes[i]) {
                        parent.cascade(child);
                    }
                }
            }
        });
    })(jQuery);



Usage example:

    
    $.cascadingAutocompletes(['#country', '#city', '#street']);



Hope this helps!
