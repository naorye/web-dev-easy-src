---
comments: true
date: 2012-11-05 17:13:36
layout: post
slug: backbone-singleton
title: Backbone Singleton
wordpress_id: 153
categories:
- Backbone.js
- JavaScript
- RequireJS
tags:
- Backbone.js
- JavaScript
- RequireJS
- singleton
---

**Sometimes we need a model that will act like a singleton. Other times we want to reuse the type of that singleton. This article will present two different ways of creating a singleton using Backbone and RequieJS. While the first way is simpler and more intuitive, the second allows us more flexibility.**



## Simple Singleton:


I am working on a little application using Backbone.js and RequireJS. The application lets the user making searches by a keyword.
Thinking of the model, I realized that I need a model that will hold the keyword and since the keyword is single in the application, it should be a singleton.
Because I am working with RequireJS, in order to simulate a singleton, I created a module that will return an instance of the Keword model. 


    
    define([ 'backbone' ], function( Backbone ) {
    	var KeywordModel = Backbone.Model.extend({
    		defaults: {
    			keyword: ''
    		}
    	});
    
    	return new KeywordModel;
    });



This way whenever I want to bind the Keyword single instance, all I have to do is just add keyword.js as a dependency:


    
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





## Desire to make history:


Now, lets assume that now I want to store searches history (each history record contains only the keyword).
Obviously this means that I have to use a collection, but which model shall I use? I cannot use KeywordModel since I don't have access to its definition. Any time I'll ask for keyword.js all I get is the model instance and not it's definition.
One solution is to create a new model and return its definition, but this solution is undesirable since we make unnecessary duplication.
In order to solve this issue we have to remember that [Backbone model's extend function](http://backbonejs.org/#Model-extend) can get an optional property called "classProperties". These set of properties can be seen as static properties that are related to the class and not to the instance. Therefore our model can be:


    
    define([ 'backbone' ], function( Backbone ) {
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



And in this way, if I add keyword.js as a dependency I get the definition and also can retrieve the singleton by calling KeywordModel.getAppKeyword(). Here is the collection of KeywordModel models:


    
    define([
    	'backbone',
    	'models/keyword'
    ], function( Backbone, KeywordModel ) {
    	var KeywordsCollection = Backbone.Collection.extend({
    		model: KeywordModel,
    		initialize: function() {
    			this.appKeyword = KeywordModel.getAppKeyword();
    			appKeyword.on( 'change: keyword', this.pushCopy, this );
    		},
    		pushCopy: function() {
    			var clone = this.appKeyword.clone();
    			this.push(clone );
    		}
    	});
    	return new KeywordsCollection;
    });



Any time the model's keyword changes, a copy of the application keyword is added to the collection.

**Thanks for reading!**
