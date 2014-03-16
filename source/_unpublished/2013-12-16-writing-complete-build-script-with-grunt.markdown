---
comments: true
date: 2013-11-23 18:51:33
layout: post
slug: complete-grunt-build-script-for-single-page-application
title: Complete Grunt Build Script for Single Page Application
categories:
- JavaScript
- CSS
- Grunt
tags:
- JavaScript
- CSS
- Grunt
---

<a href="#" target="_blank">Grunt</a> is a great tool for creating a build script for your web application. It can easily save you tons of time by creating automation to your build process from development to production. For the last few days I've created a build script for a project I am doing using Grunt and I would like to share it. My build handles many things, for example:  
<ul>
    <li>Compiles SASS to CSS</li>
    <li>Concatenates and minifies your CSS and JavaScript files</li>
    <li>Adds needed browser prefixes for CSS styles (automagically!)</li>
    <li>Runs development and production server</li>
    <li>Creates a production version out of your development code</li>
</ul>

In this article I will explain how to create such a build script. After reading this article, it will also be easy for you to add other tasks according to your build needs. 
<!-- more -->

*Installing Grunt tasks:* During this article we will use several Grunt tasks. Near each task we use, I added a link to it's git repository and a command to run in order to install it.   

##Preparation
Before we start we need to create our working environment. Follow those simple steps:

###Initializing Node and Grunt
If you haven't done so, install <a href="http://nodejs.org" target="_blank">Node.js</a> (npm will be installed with node) and Grunt command line interface (`npm install -g grunt-cli`). Installing Grunt CLI is not installing the Grunt task runner, but it will put the grunt command in your system path, allowing it to be run from any directory.   
Go to your project folder and create a package.json file by typing `npm init` and filling the tutorial. Eventually you'll get a file similar to this:
```javascript package.json
{
    {
        "name": "complete-grunt-build-script-for-single-page-application",
        "version": "0.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "BSD"
}
```
Now it is time to install the Grunt task runner. Typing `npm install grunt --save-dev` will install the Grunt task runner and will add it to package.json as a dev dependency.   
Now create a Gruntfile.js file. In this file we will define and configure our build tasks. Create the following Gruntfile.js file near package.json:
```javascript Gruntfile.js
module.exports = function(grunt) {
    grunt.initConfig({

    });
};
```

###Grunt Tasks Loader
Our build script is going to use many Grunt tasks. Each task should be loaded by calling `grunt.loadNpmTasks(...);` command. In order to save all those calls and prevent situations where we forget to load tasks, I like to use the <a href="https://github.com/sindresorhus/load-grunt-tasks" target="_blank">load-grunt-tasks</a> plugin which loads Grunt tasks automatically (according to globbing patterns). In order to use this plugin, install it (`npm install load-grunt-tasks --save-dev`) and initialize it in Gruntfile.js:
```javascript Init load-grunt-tasks
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    
    grunt.initConfig({

    });
};
```

###Define Working Folders
In this build file We will use 3 different working folders:   
<ol>
    <li>`app` folder - where our source resides</li>
    <li>`.tmp` folder - a place to put all our temporary calculations</li>
    <li>`dist` folder - for our final production code</li>
</ol>
Let's create those three folders.   
A wise thing to do is to define those working folders using <a href="http://chrisawren.com/posts/Advanced-Grunt-tooling#Using-variables-in-your-configuration" target="_blank">Grunt variables</a>. This will allow us to maintain our environment directory easily: 
```javascript Define paths
grunt.initConfig({
    // configurable paths
    paths: {
        app: 'app',
        tmp: '.tmp',
        dist: 'dist'
    }
});
```
Accessing those variables in tasks is made by underscore templates ('<%= ... %>'), for example: '<%= paths.app %>'.

##Development Server
Our first mission is to create a task that will execute our source in a development server. First, this task will clean our working folders. Then, it will compile Sass to CSS, add vendor prefixes and put all our processed CSS files under `.tmp/styles`. At the end it will create a server and open the application in a browser.

###Clean Working Folders
First thing to do is to clean the folders that we will use in this process. This is done by the <a href="https://github.com/gruntjs/grunt-contrib-clean" target ="_blank">grunt-contrib-clean task</a> (npm install grunt-contrib-clean --save-dev). This task get the folders to be cleaned. This is how we configure it:
```javascript Cleaning working folder
grunt.initConfig({
    ...
    ...
    clean: {
        /* Delete all files from .tmp */
        development: '<%= paths.tmp %>'
    },
    ...
    ...
});
```
Whenever we will run 'clean:development', .tmp folder will be cleaned. As you can see, we used here the `paths.tmp` variable that was defined before.

###Compile Sass files
Compass is a Sass framework that contains a collection of helpful tools and best practices for Sass. We will integrate compass to our gruntfile and it will translate our .scss files into .css.   
Sass and Compass get installed as Ruby gems so you'll need to have Ruby on your machine. Then, in Termial, type `sudo gem install compass` which will install compass. The next thing is to install the <a href="https://github.com/gruntjs/grunt-contrib-compass" target ="_blank">grunt-contrib-compass task</a> (npm install grunt-contrib-compass --save-dev). Now we are ready to configure it.
Let's decide that all our style files are located under `app/styles`. We want that Compass will take all the .scss files from `app/styles` and will put the compiled .css files in our temporary folder `.tmp/styles`:
 ```javascript Compass task configuration
grunt.initConfig({
    ...
    ...
    compass: {
        development: {
            options: {
                sassDir: '<%= paths.app %>/styles',
                cssDir: '<%= paths.tmp %>/styles'
            }
        }
    },
    ...
    ...
});
```
The Compass task has more many options and paths to configure (like imagesDir and javascriptsDir) and you can read about them on grunt-contrib-compass github repository. 

###Copy non-Sass files (i.e. CSS files)
Before continue process our style files, we want `.tmp/styles` to contain all our CSS files. Compass task compiles all the .scss files and put the results under `.tmp/styles`. But sometimes our project include also regular .css files which Compass task didn't copied to `.tmp/styles`. Therefore we need to copy those files using a different task. <a href="https://github.com/gruntjs/grunt-contrib-copy" target="_blank">grunt-contrib-copy task</a> is here to rescue. It is simply copy files from source to destination. Our configurations should instruct to copy all .css files under `app/styles` to `.tmp/styles`. Here are the configurations:
```javascript grunt-contrib-copy task configuration for copy styles
grunt.initConfig({
    ...
    ...
    copy: {
        // 'styles' is only a name I gave to this target
        styles: {
            expand: true,
            dot: true,
            cwd: '<%= paths.app %>/styles',
            dest: '<%= paths.tmp %>/styles/',
            src: '**/*.css'
        }
    },
    ...
    ...
});
```
Now we have all the application styles in one folder `.tmp/styles`.  

###Auto-prefix CSS properties
While writing CSS, we usually have to add vendor prefixes to new CSS properties that are not fully integrated in all browsers. Luckily, Grunt can help us here. <a href="https://github.com/nDmitry/grunt-autoprefixer" target ="_blank">grunt-autoprefixer task</a> uses the <a target="_blank" href="http://caniuse.com/">Can I Use</a> database and adds vendors prefixes to CSS properties automatically. All we have to do is to tell grunt-autoprefixer the source and destination files, and specify browsers to support and the magic happen:
 ```javascript grunt-autoprefixer task configuration
grunt.initConfig({
    ...
    ...
    autoprefixer: {
        options: {
            browsers: ['last 1 version']
        },
        development: {
            files: [{
                expand: true,
                cwd: '<%= paths.tmp %>/styles/',
                src: '**/*.css',
                dest: '<%= paths.tmp %>/styles/'
            }]
        }
    },
    ...
    ...
});
```
As you can see, we override the CSS files in our temporary folder with a vendor-prefixed version of the files.  


 

grunt.task.run([
    'clean:development',
    'templates:development',
    'compass',
    'copy:styles'
    'autoprefixer',
    'configureRewriteRules',
    'connect:server',
    'watch'
]);







Defining a model for controller
-------------------------------
Let's start with a simple example. I would like to display a book view. This is the controller:
```javascript BookController
app.controller('BookController', ['$scope', function($scope) {
    $scope.book = {
        id: 1,
        name: 'Harry Potter',
        author: 'J. K. Rowling',
        stores: [
            { id: 1, name: 'Barnes & Noble', quantity: 3},
            { id: 2, name: 'Waterstones', quantity: 2},
            { id: 3, name: 'Book Depository', quantity: 5}
        ]
    };
}]);
```
This controller creates a model of book which can be later used in our template:
```html template for displaying a book
<div ng-controller="BookController">
    Id: <span ng-bind="book.id"></span>
    <br/>
    Name:<input type="text" ng-model="book.name" />
    <br/>
    Author: <input type="text" ng-model="book.author" />
</div>
```
In case we would like to get the book data from a backend api, we can also use $http:
```javascript BookController with $http
app.controller('BookController', ['$scope', '$http', function($scope, $http) {
    var bookId = 1;
 
    $http.get('ourserver/books/' + bookId).success(function(bookData) {
        $scope.book = bookData;
    });
}]);
```
Notice that bookData is still a JSON object.
Later on we would like to do something with this data. For example, update the book, delete it or even do other operations that are not dealing with the backend, like generate a book image url according to requested size or determining whether the book is available. Those methods can be declared on our controller:
```javascript BookController with several book actions
app.controller('BookController', ['$scope', '$http', function($scope, $http) {
    var bookId = 1;
    
    $http.get('ourserver/books/' + bookId).success(function(bookData) {
        $scope.book = bookData;
    });

    $scope.deleteBook = function() {
        $http.delete('ourserver/books/' + bookId);
    };

    $scope.updateBook = function() {
        $http.put('ourserver/books/' + bookId, $scope.book);
    };

    $scope.getBookImageUrl = function(width, height) {
        return 'our/image/service/' + bookId + '/width/height';
    };

    $scope.isAvailable = function() {
        if (!$scope.book.stores || $scope.book.stores.length === 0) {
            return false;
        }
        return $scope.book.stores.some(function(store) {
            return store.quantity > 0;
        });
    };
}]);
```
And later in our template:
```html template for displaying a complete book
<div ng-controller="BookController">
    <div ng-style="{ backgroundImage: 'url(' + getBookImageUrl(100, 100) + ')' }"></div>
    Id: <span ng-bind="book.id"></span>
    <br/>
    Name:<input type="text" ng-model="book.name" />
    <br/>
    Author: <input type="text" ng-model="book.author" />
    <br/>
    Is Available: <span ng-bind="isAvailable() ? 'Yes' : 'No' "></span>
    <br/>
    <button ng-click="deleteBook()">Delete</button>
    <br/>
    <button ng-click="updateBook()">Update</button>
</div>
```

Sharing a model between controllers
-----------------------------------
As long as the book's structure and methods are relevant only to one controller, all is fine and our work here is done. But as the application grows, there might be other controllers that will deal with books. Those controllers will sometimes need to fetch a book, update it, delete it or get it's image url or availability. Therefore we have to share the behaviors of a book between controllers. In order to do this we will use a factory that returns the book's behavior. Before writing this factory, I would like to mention here that we could make the factory return an object that contains helper methods for book (i.e. functions that get a book JSON and do what asked), but I prefer to use <a>prototype</a> for constructing a Book class, which I believe is the right choice:
```javascript Book model service
app.factory('Book', ['$http', function($http) {
    function Book(bookData) {
        if (bookData) {
            this.setData(bookData):
        }
        // Some other initializations related to book
    };
    Book.prototype = {
        setData: function(bookData) {
            angular.extend(this, bookData);
        },
        load: function(id) {
            var scope = this;
            $http.get('ourserver/books/' + bookId).success(function(bookData) {
                scope.setData(bookData);
            });
        },
        delete: function() {
            $http.delete('ourserver/books/' + bookId);
        },
        update: function() {
            $http.put('ourserver/books/' + bookId, this);
        },
        getImageUrl: function(width, height) {
            return 'our/image/service/' + this.book.id + '/width/height';
        },
        isAvailable: function() {
            if (!this.book.stores || this.book.stores.length === 0) {
                return false;
            }
            return this.book.stores.some(function(store) {
                return store.quantity > 0;
            });
        }
    };
    return Book;
}]);
```
This way all book's behavior is encapsulated in Book service. Now, let's use our shiny Book service in our BookController:
```javascript BookController that uses Book model
app.controller('BookController', ['$scope', 'Book', function($scope, Book) {
    $scope.book = new Book();
    $scope.book.load(1);
}]);
```
As you can see, the controller became very thin. It now creates a Book instance, assigns it to the scope and loads it from the backend. When the book will be loaded, it's properties will be changed and so the template. Keep in mind that other controllers that interact with a book, simply inject the Book service. We have to change the template to use book's methods as well:
```html template that uses book instance
<div ng-controller="BookController">
    <div ng-style="{ backgroundImage: 'url(' + book.getImageUrl(100, 100) + ')' }"></div>
    Id: <span ng-bind="book.id"></span>
    <br/>
    Name:<input type="text" ng-model="book.name" />
    <br/>
    Author: <input type="text" ng-model="book.author" />
    <br/>
    Is Available: <span ng-bind="book.isAvailable() ? 'Yes' : 'No' "></span>
    <br/>
    <button ng-click="book.delete()">Delete</button>
    <br/>
    <button ng-click="book.update()">Update</button>
</div>
```
Up to here we saw how to model a data, encapsulate all its methods in one class and share this class between controllers without code duplication. 

Model of the same book in several controllers
---------------------------------------------
So we have a book model definition and several controllers that work with books. After using this modeling architecture you will notice that there is a big problem.
Up to now we supported several controllers that do operations with books. But what will happen if two controllers will deal with the same book?   
Assume that we have a section with a list of names of all our books and another section with an editable view of a book. We have two controllers, one for each section. The first controller loads the books list and the second controller loads a single book. Our user sees the second section, edit the name of the book and then presses on the "update" button. The update process will succeed and the book name will be changed. But in the books list section the user still sees the old name! What happened actually is that there were two different instances of the same book - one for the books list and one for the editable view. When the user edited the book's name, he actually changed the name property of the book instance that was binded to the editable view. Whereas the book instance that was binded to the books list view didn't changed.   
The solution for this problem is to share the same books instances with any controller that needs them. This way both the books list controller and the editable view controller will hold the same book instance and whenever this instance is changed, the changes will be reflected in all the views. Translating words to actions, we have to create a booksManager service (the letter b is not capital because it is an object and not a Class) that will manage books instances pool and will be responsible for returning instances of books. If the required instance doesn't exist in the pool, the service will create it. If the required instance already exists in the pool, the service will only return it. Keep in mind that all the functions that load instances of books will be defined eventually only in our booksManager service since it has to be the only component that provide books instances.
```javascript booksManager service
app.factory('booksManager', ['$http', '$q', 'Book', function($http, $q, Book) {
    var booksManager = {
        _pool: {},
        _retrieveInstance: function(bookId, bookData) {
            var instance = this._pool[bookId];

            if (instance) {
                instance.setData(bookData);
            } else {
                instance = new Book(bookData);
                this._pool[bookId] = instance;
            }

            return instance;
        },
        _search: function(bookId) {
            return this._pool[bookId];
        },
        _load: function(bookId, deferred) {
            var scope = this;

            $http.get('ourserver/books/' + bookId)
                .success(function(bookData) {
                    var book = scope._retrieveInstance(bookData.id, bookData);
                    deferred.resolve(book);
                })
                .error(function() {
                    deferred.reject();
                });
        },
        /* Public Methods */
        /* Use this function in order to get a book instance by it's id */
        getBook: function(bookId) {
            var deferred = $q.defer();
            var book = this._search(bookId);
            if (book) {
                deferred.resolve(book);
            } else {
                this._load(bookId, deferred);
            }
            return deferred.promise;
        },
        /* Use this function in order to get instances of all the books */
        loadAllBooks: function() {
            var deferred = $q.defer();
            var scope = this;
            $http.get('ourserver/books)
                .success(function(booksArray) {
                    var books = [];
                    booksArray.forEach(function(bookData) {
                        var book = scope._retrieveInstance(bookData.id, bookData);
                        books.push(book);
                    });
                    
                    deferred.resolve(books);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        /*  This function is useful when we got somehow the book data and we wish to store it or update the pool and get a book instance in return */
        setBook: function(bookData) {
            var scope = this;
            var book = this._search(bookData.id);
            if (book) {
                book.setData(bookData);
            } else {
                book = scope._retrieveInstance(bookData);
            }
            return book;
        },

    };
    return booksManager;
}]);
```
Our Book service is now without the load method:
```javascript Book model without the load method
app.factory('Book', ['$http', function($http) {
    function Book(bookData) {
        if (bookData) {
            this.setData(bookData):
        }
        // Some other initializations related to book
    };
    Book.prototype = {
        setData: function(bookData) {
            angular.extend(this, bookData);
        },
        delete: function() {
            $http.delete('ourserver/books/' + bookId);
        },
        update: function() {
            $http.put('ourserver/books/' + bookId, this);
        },
        getImageUrl: function(width, height) {
            return 'our/image/service/' + this.book.id + '/width/height';
        },
        isAvailable: function() {
            if (!this.book.stores || this.book.stores.length === 0) {
                return false;
            }
            return this.book.stores.some(function(store) {
                return store.quantity > 0;
            });
        }
    };
    return Book;
}]);
```
Our EditableBookController and BooksListController controllers looks like:
```javascript EditableBookController and BooksListController that uses booksManager
app
    .controller('EditableBookController', ['$scope', 'booksManager', function($scope, booksManager) {
        booksManager.getBook(1).then(function(book) {
            $scope.book = book
        });
    }])
    .controller('BooksListController', ['$scope', 'booksManager', function($scope, booksManager) {
        booksManager.loadAllBooks().then(function(books) {
            $scope.books = books
        });
    }]);
```
Notice that the templates remain the same as they still use instances. Now the application will hold only one book instance with id equals to 1 and any change on it will be reflected on all views that use it.

Summary
-------
On this article I suggested an architecture for modeling data in AngularJS. First, I presented the default model binding of AngularJS, then I showed how to encapsulate the model's methods and operations so we can share it between different controllers, and finally I explained how to manage our models instances so all the changes will be reflected on all the application views.   

I hope this article gave you ideas how to implement your data models. If you have any question, don't hesitate to ask!

NaorYe