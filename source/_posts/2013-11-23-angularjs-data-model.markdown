---
comments: true
date: 2013-11-23 18:51:33
layout: post
slug: angularjs-data-model
title: AngularJS Data Model
spot: angularjs
categories:
- JavaScript
- AngularJS
tags:
- JavaScript
- AngularJS
---

As we already know, AngularJS doesn't come with an out of the box solution for data modeling. In the most abstract way, AngularJS lets us use JSON data as a model in the controller. As the time passed and my application grew, I realized that this modeling method isn't powerful enough to fit my application's needs. In this article I will present the way I dealt with data modeling in my AngularJS application.   
<!-- more -->
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
            return 'our/image/service/' + this.book.id + '/' + width + '/' + height;
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