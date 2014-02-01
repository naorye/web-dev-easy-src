---
layout: post
slug: searcher-backbone-application-demonstration
title: Searcher - Backbone application demonstration
spot: backbone.js
date: 2013-01-23 19:03
comments: true
categories:
- Backbone.js
- JavaScript
tags:
- Backbone.js
- JavaScript
---


In this article we will build Backbone.js application along with jQuery, underscore.js and require.js. The aim of this article is to demonstrate the use of Backbone components. As we all probably know, there are more then one way to build Backbone applications so feel comfortable to adopt what you like.   
At the end of this article we will have Backbone searcher application which will know to make searches using different search providers. You can see our final application in action <a href="../code/searcher/index.html" target="_blank">here</a> and can download the code <a href="../code/searcher/searcher.zip" target="_blank">here</a>.
<!-- more -->

Application Loading Flow
------------------------

### index.html ###
Let's begin with our application loading flow. After typing the url, the browser starts loading the index.html file:

{% include_code lang:html index.html searcher/index.html %}

The index.html file contains the layout of our application which include placeholders for the search section, the history section and the search results area. It also includes reference to css file and reference to the require.js script.
When the browser loads this html file, right after loading style.css, the browser loads the require.js script. Look closely and you'll notice that require.js script tag has additional attribute called "data-main". This attribute tells require.js to load js/main.js after require.js loads.

### js/main.js ###
This file contains two sections:

* Configuration section that configure the require.js paths and modules.
* Initialization section that initialize the application.

{% include_code lang:javascript js/main.js Searcher/js/main.js %}

require.js configuration allows us to map modules paths to names. For example, jQuery.js file is located in "libs/jquery-1.8.2.min". Whenever we wish mark jQuery as a dependency, we will have to write this long path. Since jQuery is basic module and we probably use it a lot, it is better to map its path.   
require.js works with <a href="http://requirejs.org/docs/whyamd.html" target="_blank">AMD modules</a>. The AMD structure tells require.js what are the dependencies and which object to return. The purpose of the shim configuration is to tell require.js for each un-AMD module what is its dependencies and which object to return.   
After the configurations done, we ask require.js to load Backbone, router.js and app.js, and after that execute the initialization function. This function gets as parameters the AMD modules that require.js required to resolve and initializes the router, initializes the app and starts Backbone.history.

### app.js ###
{% include_code lang:javascript js/app.js searcher/js/app.js %}

Lets see what app.js initialization function does:

* Keeps reference of the router and initializes instance of QueryModel. This appQuery instance acts as a singleton and every time it changes, the router changes the url to "search/&lt;sourceId&gt;/&lt;term&gt;" (without trigger a route event).
* Initializes the main views of the application - SearchView and HistoryView.
* Creates two new search sources. For each source it is necessary to know it's name, id (for internal purposes) and it's main view. Later we will discuss on the sources feature.
* Creates sourceManager that knows manage search sources (we will discuss on it later also) and adds to it the two search sources.
* Adds the two search sources to the search view.

At this point, the application loading flow is over and now the application waits for user interaction.
In order to understand completely how everything bonds together and works, we must understand the application features and components.

### router.js ###
{% include_code lang:javascript js/router.js searcher/js/router.js %}

The router depends on app.js. Whenever a route in form "search/&lt;sourceId&gt;/&lt;term&gt;" is entered to the url, the router trigger the searchImages() method which changes the appQuery singleton.

Application Features and Components
-----------------------------------

Now it is time to review the searching, sources and the history features.

### Searching ###
The main purpose of the application is to allow searching. The application makes searches among different search providers, therefore the input it gets from the user contains a search term and a search provider. So, we need a model to store this information. Actually, a single instance of this model will serve us during the entire use of the application. Each time the user makes a different search (change the search term or provider), the model instance changes. Later, those model changes will trigger the search.

{% include_code lang:javascript js/models/query.js searcher/js/models/query.js %}

QueryModel has two attributes. "term" for holding the search term and "sourceId" for holding the search provider. The default value for both attributes are the empty string.

SearchView view creates the inputs and adds the behavior of the searching process.

{% include_code lang:javascript js/views/search.js searcher/js/views/search.js %}

SearchView renders itself on initialization, and every time appQuery changes it updates the input values. On render, the view draws itself using <a href="http://underscorejs.org/#template" target="_blank">underscore templates</a> and initializes the inputs according to the appQuery. Whenever the user clicks on the search button, the view set appQuery with the new values which causing the url to change (as we saw in app.js). Notice that SearchView uses the text plugin of require.js in order to load templates/search.html. In addition, the compiled version of templates are stored in searchTemplate and in optionTemplate in order to save compilations. SearchView contains the addSource() method which gets sourceModel instance as parameter (we will see it later) and adds the new source to the sources select list.

### Sources ###
As I mentioned before, the application makes searches among different search providers. The sources mechanism is responsible for defining search providers, their models and their views. This feature includes the SourcesManager view which acts as a bridge and responsible for rendering the relevant search results according to appQuery.

{% include_code lang:javascript js/sources/sources-manager.js searcher/js/sources/sources-manager.js %}

When initialized with appQuery as model, SourcesManager renders itself on appQuery change. SourceManager has the ability to add sources using the addSource() function or using the initialization "sources" option. When it renders, it resolves the search provider's view according to appQuery and renders it.
SourceManager initialization occurs inside the application initialization:
```javascript SourcesManager initialization
    this.sourcesManager = new SourcesManager( {
        el: '.content',
        model: this.appQuery,
        sources: [
            new SourceModel({
                id: 'library-of-congress',
                name: 'Library Of Congress',
                view: LocGridView
            }),
            new SourceModel({
                id: 'google-shopping',
                name: 'Google Shopping',
                view: GoogleListView
            })
        ]
    });
```
appQuery is the SourcesManager model and the search results are rendered inside ".content" element. The search providers are also defined here using the SourceModel. Each search provider should have id, name and main view which will be displayed when selected.

{% include_code lang:javascript js/models/source.js searcher/js/models/source.js %}

#### Google Shopping search provider ####
Let's explore the Google Shopping search provider. It's files located under js/sources/google-search-api-for-shopping and it consist of ProductModel, ProductsCollection, products template and it's main view called ListView.

{% include_code lang:javascript js/sources/google-search-api-for-shopping/models/product.js searcher/js/sources/google-search-api-for-shopping/models/product.js %}

Each product contains title, description, link for the product and a small thumbnail. The parse method is used by Backbone in order to parse the response  of single product, when fetching the data from Google.

{% include_code lang:javascript js/sources/google-search-api-for-shopping/collections/products.js searcher/js/sources/google-search-api-for-shopping/collections/products.js %}

The products collection consist of ProductModel models and the url attribute is used by Backbone fetch method.

{% include_code lang:html js/sources/google-search-api-for-shopping/templates/products.html searcher/js/sources/google-search-api-for-shopping/templates/products.html %}

The search results structure defined inside the products.html as a table that contains all the products. For each product, a new product row with thumbnail, title and description is created.
Search providers can contain many views. When defining the search provider in SourcesManager, we must tell which view is the main view to display. ListView is the main view of the Google Shopping search provider.

{% include_code lang:javascript js/sources/google-search-api-for-shopping/views/list.js searcher/js/sources/google-search-api-for-shopping/views/list.js %}

ListView initializes ProductsCollection and on render fetch it and append the results to el. In case of an error or empty results, a relevant text message appears. Behind the scenes, the fetch method uses the jQuery.ajax function and the data option is passed to it. The data option contains needed properties for the Google Shopping api. Keep in mind that in your application you will need to use yours Google api key.
Now, whenever the user chooses Google Shopping as a search provider, SourcesManager initializes ListView which fetches the results and display them inside ".content" element.

### History ###
Another feature of this application is history. The application stores queries history and enables us to make searches from history. In order to store the queries history we need a collection of QueryModel:

{% include_code lang:javascript js/collections/queries.js searcher/js/collections/queries.js %}

Now, in order to display the history and make each history entry clickable, There is the HistoryView:

{% include_code lang:javascript js/views/history.js searcher/js/views/history.js %}

HistoryView gets appQuery as a model, and on initialization it creates QueriesCollection instance. Whenever the appQuery changes, the view adds it to queries collection and renders itself. Render takes the queries collection and generates the markup from the queriesListTemplate dependency. Whenever the user click on history entry, the setModel() function triggered and set appQuery with the history values. As a result of appQuery change, SourcesManager's render occurred. 