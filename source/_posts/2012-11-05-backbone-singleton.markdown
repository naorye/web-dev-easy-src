---
comments: true
date: 2012-11-05 17:13:36
layout: post
slug: backbone-singleton
title: Backbone Singleton
spot: backbone.js
wordpress_id: 153
categories:
- Backbone.js
- JavaScript
- require.js
tags:
- Backbone.js
- JavaScript
- require.js
- singleton
---

Using Backbone.js, sometimes we need a model that will act like a singleton. Other times we want to reuse the type of that singleton. This article will present two different ways of creating a singleton using Backbone.js and require.js. While the first way is simpler and more intuitive, the second allows us more flexibility
<!-- more -->


Simple Singleton
----------------
I am working on a little application using Backbone.js and require.js. The application lets the user making searches by a keyword.   
Thinking of the model, I realized that I need a model that will hold the keyword and since the keyword is single in the application, it should be a singleton.
Because I am working with require.js, in order to simulate a singleton, I created a module that will return an instance of the Keyword model. 
```javascript KeywordModel
define([
    'backbone'
], function( Backbone ) {
	var KeywordModel = Backbone.Model.extend({
		defaults: {
			keyword: ''
		}
	});

	return new KeywordModel;
});
```
This way whenever I need the Keyword single instance, all I have to do is just add keyword.js as a dependency:

``` javascript Getting the Keyword single instance
define([
	'backbone',
	'models/keyword'
], function( Backbone, keywordModel ) {
	var SearchView = Backbone.View.extend({
		el: '#search'
		events: {
			'change': 'setModel'
		},
		initialize: function() {
			keywordModel.on( 'change: keyword', this.render, this );
		},
		render: function() {
			var keyword = keywordModel.get('keyword');
			this.$el.val(keyword);
		},
		setModel: function() {
			var keyword = this.$el.val();
			keywordModel.set({ keyword: keyword });
		}
	});

	return SearchView;
});
```
The first time require.js required to load models/keyword.js, it gets it from the server and returns a new instance of KeywordModel. The next time we ask require.js for models/keyword.js, instead of creating a new instance, require.js returns us the cached instance.

Desire To Make History
----------------------
Now, lets assume that I want to store searches history (each history record contains only the keyword).   
Obviously this means that I have to use a collection, but which model shall I use? I cannot use KeywordModel since I don't have access to its definition. Any time I'll ask for models/keyword.js all I get from require.js is the model instance and not it's definition.   
One solution is to create a new model and return its definition, but this solution is undesirable since we make unnecessary duplication.   
In order to solve this issue we have to remember that <a href="http://backbonejs.org/#Model-extend" target="_blank">Backbone model's extend function</a> can get an optional parameter called "classProperties". These set of properties can be seen as static properties that are related to the class and not to the instance. Therefore our model can be:
```javascript Using class properties
define([
    'backbone'
], function( Backbone ) {
	var KeywordModel = Backbone.Model.extend({
		defaults: {
			keyword: ''
		}
	}, {
		singleton: null,
		getAppKeyword: function() {
			KeywordModel.singleton =
				KeywordModel.singleton || new KeywordModel;
			return KeywordModel.singleton;
		}
	});

	return KeywordModel;
});
```
And now, asking for models/keyword.js as a dependency will get us the definition which can be used to retrieve the singleton by calling KeywordModel.getAppKeyword(). Here is the collection of KeywordModel models:
```javascript Collection of KeywordModel models
define([
	'backbone',
	'models/keyword'
], function( Backbone, KeywordModel ) {
	var KeywordsCollection = Backbone.Collection.extend({
		model: KeywordModel,
		initialize: function() {
			this.appKeyword = KeywordModel.getAppKeyword();
			this.appKeyword.on( 'change: keyword', this.pushCopy, this );
		},
		pushCopy: function() {
			var clone = this.appKeyword.clone();
			this.push(clone );
		}
	});
	return new KeywordsCollection;
});
```
This way, any time the model's keyword changes, a copy of the application keyword is added to the collection.

I hope this short article gave you another new ideas, thanks for reading!