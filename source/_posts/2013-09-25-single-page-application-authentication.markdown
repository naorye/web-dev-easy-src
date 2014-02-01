---
comments: true
date: 2013-09-25 20:27:44
layout: post
slug: single-page-application-authentication
title: Single Page Application Authentication
spot: webdevelopment
categories:
- JavaScript
tags:
- Node.js
- AngularJS
- JavaScript
---

This article will guide you how to add user authentication to your single page application. On the back end side I will use Node.js and on the front end side I will use AngularJS. Although I used specific frameworks, you may apply the same technique for different back end and frond end frameworks (rails, Backbone, etc...).   
The final application will look like this (without the horrible styling):<!--
--><iframe src="http://spa-auth.herokuapp.com/" width="580px" height="150px" scrolling="no" style="overflow:hidden;margin:0 45px;"></iframe>
<!-- more -->

At the beginning of this article I will build an application based on <a target="_blank" href="http://nodejs.org">Node.js</a>, <a target="_blank" href="http://expressjs.com/">express</a>, <a target="_blank" href="http://mongoosejs.com/">mongoose</a> and <a target="_blank" href="http://angularjs.org/">AngularJS</a> and then I will add authentication support. At the end we will have single page application that allows users to login and logout from our system. For this article I chose to implement facebook authentication, but changing this later to other 3rd party or local authentication will be trivial.   
One thing important to mention is that the final application will contain the minimum code required for this guide so don't use it as a boilerplate code, the best thing is to learn from it and implement it yourself in your application.

## Create an application
At the beginning, let's create a single page application.

### Node.js server: app.js
First thing we do is loading required modules:
```javascript Load required modules and configurations
var fs = require('fs')
    mongoose = require('mongoose'),
    http = require('http');
```
Then we connect to our mongo database (you should define your own) and load some mongoose models (right now we don't have any model):
```javascript Connect to mongo db and load mongoose models
mongoose.connect('<mongodb uri>');

var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function(file) {
    if (file.substring(-3) === '.js') {
        require(models_path + '/' + file);
    }
});
```
Last things to do is to configure express application, define its routes and start it. Express configurations and routes definitions are made in different files in order to keep the application easy to maintain.
```javascript Configure express, define routes and start
var app = require('./config/express')(config);
require('./config/routes')(app, config);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

exports = module.exports = app;
```

### Express configuration: config/express.js
There is nothing special in this express configurations file. Amongst all the configurations, we:

* Set our views path to be /app/views
* Set our view engine to <a target="_blank" href="https://github.com/visionmedia/ejs">ejs</a>
* Use <a target="_blank" href="http://kcbanner.github.io/connect-mongo/">connect-mongo</a> as a session store (you need to define your &lt;mongodb uri&gt;)
* Define /public as a static folder (this folder will contain our front end application) 

```javascript express configurations
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    path = require('path');

module.exports = function (config) {
    var app = express();

    var root = path.normalize(__dirname + '/..');

    app.set('showStackError', true);

    app.set('port', process.env.PORT || 3000);
    app.set('views', root + '/app/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());

    app.use(express.logger('dev'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

    app.use(express.session({
        secret: 'my-session-store',
        store: new mongoStore({
            url: '<mongodb uri>',
            collection : 'sessions'
        })
    }));

    app.use(express.static(root + '/public'));

    app.use(app.router);

    if ('development' == app.get('env')) {
        app.use(express.errorHandler());

        app.use(function(req, res, next) {
             console.log(req.url);
             next();
        });
    }

    return app;
};
```

### Routes definition: config/routes.js
Our routes definitions are very simple. We need to be able to serve secured data only for our members as well as unsecured data for all users. Therefore the router handles the following endpoints:

* GET request on api/secured/* for secured data
* GET request on api/* for unsecured data
* All other GET requests return the index view (except for static content that was defined on express configurations)

```javascript Routes definition
module.exports = function (app, passport, config) {
    app.get('api/secured/*',
        function (req, res, next) {
            // Need to filter anonymous users somehow 
            /*if (not logged in) {
                return res.json({ error: 'This is a secret message, login to see it.' });
            }*/
            next();
        },
        function (req, res) {
            res.json({ message: 'This message is only for authenticated users' });
        });


    app.get('api/*', function (req, res) {
        res.json({ message: 'This message is known by all' });
    });


    app.get('/*', function (req, res) {
        res.render('index');
    });
};
```
Notice that GET request on api/secured/* should return error JSON for anonymous users.

### Front end
Our front end, which consists of AngularJS, has an html markup that contains a secured message and an unsecured message:
```html Markup
<div ng-controller="MessageController">
    Unsecured message: <span ng-bind="messages.unsecured"></span>
    <br/>
    Secured message: <span ng-bind="messages.secured"></span>
</div>
```
At the end we would like the secured message to be displayed only to authenticated users.   

This is our MessageController:
```javascript MessageController
app.controller('MessageController', ['$scope', '$http', function($scope, $http) {
    $scope.messages = {};

    $http.get('/api/secured/message').success(function(data) {
        $scope.messages.secured = data.message || data.error;
    });

    $http.get('/api/message').success(function(data) {
        $scope.messages.unsecured = data.message || data.error;
    });
}]);
```

You can download the application we have so far, without authentication, <a target="_blank" href="../code/single-page-application-authentication/single-page-application-without-authentication.zip">here</a>. In order to run the application, fill in your &lt;mongodb uri&gt; in config/express.js, execute 'npm install' and then execute 'npm start'.   
Now is the time to add authentication. 

## Authentication support
For supporting authentication, we will use <a target="_blank" href="http://passportjs.org/">Passport</a> which is a really simple authentication middleware for Node.js. There are other good authentication middlewares like <a target="_blank" href="http://everyauth.com/">everyauth</a> or <a target="_blank" href="https://github.com/ciaranj/connect-auth">connect-auth</a>, but I find Passport more modular and easy to use.   
Supporting facebook authentication with Passport requires to add "passport" and "passport-facebook" packages to package.json.   

Before I continue, I'd like to describe how the whole authentication process is going to be:

1. The first time the user enters the application, he is not authenticated. 
2. The user presses the "Login" button and a new window is opened. Because the authentication process includes redirection to facebook, I decided to open a new window in order to keep the current state of the application window.
3. This new window leads to an endpoint that triggers Passport and the authentication process begins.
4. During the authentication process, Passport redirects the user to facebook for authentication. When facebook authentication is completed, facebook redirects the user back to the application which will attempt to obtain an access token. If access was granted, the user will be logged in. Otherwise, authentication has failed. 
5. If authentication succeeds, Passport creates a new user (or loads the user in case of returning user) and establishes a new session. This session will be maintained via a cookie set in the user's browser.
6. After authentication is completed, Passport redirects the new window to an "after-auth" view that informs the parent opener window about the authentication state and the user data.
7. The next time the user enters to the application, the cookie will identify the session and the user will become logged in.

Therefore, our to do list is:

* Create User model for representing users
* Tell Passport how to create or load user instances according to facebook response
* Create an after-auth view for completing the authentication
* Create endpoints that triggers the authentication process and renders the after-auth view

Now stop talking and let's create the User mongoose model.

### User mongoose model

```javascript User mongoose model
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    user_image: String,
    facebook_id: String,
    facebook: { },
    createdAt: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('User', UserSchema);
```
As you can see, the User model is very simple. Except the usual user details, we also want to store the user's facebook id and the whole JSON returned from facebook.

### Fetching the current user
In order to be able to login using facebook, Passport requires an authentication mechanism (called Strategy). "passport-facebook" package gives us FacebookStrategy class which implements such mechanism. All we have to do is to tell Passport to use FacebookStrategy and implement a method that creates or loads a user according to facebook profile id.   
(Note that in order to use this code, you have to supply your facebook app id and facebook app secret)
```javascript FacebookStrategy for Passport
passport.use(new FacebookStrategy({
        clientID: '<Your facebook app id>',
        clientSecret: '<Your facebook app secret>',
        callbackURL: '/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, done) {
        User.findOne({ 'facebook.id': profile.id }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.username,
                    provider_id: profile.id,
                    provider: 'facebook',
                    facebook: profile._json
                });
                user.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    }));
```
When Passport gives us the user's facebook profile, we perform mongodb search for the user according to his facebook profile id. If the user is not found, we create a new user model and save it. Eventually we return the user instance.   
In addition to constructing the user from his facebook profile, we also have to tell Passport how to serialize and deserialize user instance to and from a session:
```javascript Serialize and deserialize user instance  
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
        done(err, user);
    });
});
```
When user is authenticated, passport serializes the user and stores the result in a session cookie. When a user with session cookie arrives to the system, Passport deserialize the user instance.

### After-authentication view
After facebook approves or disapproves the user, Passport tries to obtain access token and renders after-auth view. This view contains a script that passes the login state along with the user data (in case of success login) to the parent window. This is done by defining an accessible method on the application window that knows to handle logins results. Let's take a look on the after-auth view:
```html after-auth view
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Single Page Application Authentication - Auth Success</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
</head>
<body>
<script type="text/javascript">
    if (window.opener) {
        window.opener.focus();

        var state = '<%= state %>';
        var user = <%- JSON.stringify(user) %>;
        if (window.opener.app &&
            window.opener.app.authState) {
            
            window.opener.app.authState(state, user);
        }
    }
    window.close();
</script>
</body>
</html>
```
As you can see, this view contains only script code that notifies the application about the authentication state and the user data. Later we will define the authState() method that handles the result. At the end, the pop-up window is closed.

Now is the time to connect all the actions. Let's see our new endpoints.

### New routes definition
First, let's take a look on the endpoints that handles the login:
```javascript Login endpoints
    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/auth/success', failureRedirect: '/auth/failure' }));
    app.get('/auth/success', function(req, res) {
        res.render('after-auth', { state: 'success', user: req.user ? req.user : null });
    });
    app.get('/auth/failure', function(req, res) {
        res.render('after-auth', { state: 'failure', user: null });
    });
```
When the user asks for /auth/facebook, Passport redirects the user to facebook which in turn redirects the user back to /auth/facebook/callback (accoring to FacebookStrategy implementation). Then, Passport tries to get access token and redirects to /auth/success or /auth/failure according to the result.   
Both /auth/success and /auth/failure render our after-auth view with different parameters.   
Another endpoint for logout will be DELETE request on /auth:
```javascript Logout endpoint
app.delete('/auth', function(req, res) {
    req.logout();
    res.writeHead(200);
    res.end();
});  
```
The last thing to do is to fix our secured data endpoint:
```javascript Secured data endpoint
app.get('/api/secured/*',
    function (req, res, next) {
        if (!req.user) {
            return res.json({ error: 'This is a secret message, login to see it.' });
        }
        next();
    },
    function (req, res) {
        res.json({ message: 'This message is only for authenticated users' });
    });
```
First we check whether req.user exists. In case it doesn't, we return an error JSON.   

After all our hard work, now is the time to see our authentication in action!

## Authentication in action
In order to demonstrate our authentication implementation, we have to complete our front end application. Let's create AngularJS service that will be responsible to the user session. The purposes of such service are:   

* Initiate the authentication process
* Allow logout
* Supply handlers for authentication success / failure and maintain session state
```javascript Session service
app.factory('sessionService', ['$rootScope', '$window', '$http',
    function ($rootScope, $window, $http) {
    var session = {
        init: function () {
            this.resetSession();
        },
        resetSession: function() {
            this.currentUser = null;
            this.isLoggedIn = false;
        },
        facebookLogin: function() {
            var url = '/auth/facebook',
                width = 1000,
                height = 650,
                top = (window.outerHeight - height) / 2,
                left = (window.outerWidth - width) / 2;
            $window.open(url, 'facebook_login', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
        },
        logout: function() {
            var scope = this;
            $http.delete('/auth').success(function() {
                scope.resetSession();
                $rootScope.$emit('session-changed');
            });
        },
        authSuccess: function(userData) {
            this.currentUser = userData;
            this.isLoggedIn = true;
            $rootScope.$emit('session-changed');
        },
        authFailed: function() {
            this.resetSession();
            alert('Authentication failed');
        }
    };
    session.init();
    return session;
}]);
```
Calling sessionService.facebookLogin() and sessionService.logout() will log us in and out from the application. sessionService.authSuccess() and sessionService.authFailed() are methods that get called whenever the application gets notified about the authentication state. From now on, whenever we like, we can use sessionService.isLoggedIn and sessionService.currentUser in order to know the authentication state and get the current logged in user. Our service also triggers a 'session-changed' event each time the session changed.   

Lt's see now the changes in MessageController
```javascript MessageController
app.controller('MessageController', ['$scope', '$rootScope', '$http',
    function($scope, $rootScope, $http) {
        $scope.messages = {};

        function loadMessages() {
            $http.get('/api/secured/message').success(function(data) {
                $scope.messages.secured = data.message || data.error;
            });

            $http.get('/api/message').success(function(data) {
                $scope.messages.unsecured = data.message || data.error;
            });
        }

        var deregistration = $rootScope.$on('session-changed', loadMessages);
        $scope.$on('$destroy', deregistration);

        loadMessages();
    }]);
```
MessageController basically remains the same, except that each time 'session-changed' event is triggered, the controller reloads the messages.   

Now is the time to add Login and Logout buttons and bind them to actions. Those buttons will be visible only when necessary. 
```html Login and logout buttons
<button ng-hide="session.isLoggedIn" ng-click="session.facebookLogin()">Login</button>
<span ng-show="session.isLoggedIn" ng-bind="'Hello ' + session.currentUser.name"></span>
<button ng-show="session.isLoggedIn" ng-click="session.logout()">Logout</button>
```
In order the variable "session" to be recognized in the template, we will make the following assignment:
```javascript session assignment to $rootScope
app.run(['$rootScope', 'sessionService', function ($rootScope, sessionService) {
    $rootScope.session = sessionService;
}]);
```
Now we have to define the authState() method that handles the result from the authentication pop-up window:
```javascript app.authState() definition
app.run(['$rootScope', '$window', 'sessionService', function ($rootScope, $window, sessionService) {
    $window.app = {
        authState: function(state, user) {
            $rootScope.$apply(function() {
                switch (state) {
                    case 'success':
                        sessionService.authSuccess(user);
                        break;
                    case 'failure':
                        sessionService.authFailed();
                        break;
                }
                
            });
        }
    };
}]);
```  
One last thing to do is to determine the authentication state when the application loads. On our template we add a script that assigns the current user (or null) to window.user:
```html Assigning the current user to window.user
<script type="text/javascript">
    window.user = <%- JSON.stringify(user) %>;
</script>
```
Where the "user" variable comes from our endpoint:
```javascript Injecting the current user to the view
    app.get('/*', function (req, res) {
        res.render('index', { user: req.user ? req.user : null });
    });
```
And when the front end application loads, we initialize the session according to window.user:
```javascript Initiate the front end session state
app.run(['sessionService', '$window', function (sessionService, $window) {
    if ($window.user !== null) {
        sessionService.authSuccess($window.user);
    }
}]);
```

Congratulations! Now we have a secured application with facebook authentication!   

Download & GitHub & Demo
------------------------
* Download the application with authentication support <a target="_blank" href="../code/single-page-application-authentication/single-page-application-with-authentication.zip">here</a> (don't forget to run 'npm install' before starting the application with 'npm start')
* See a demonstration of the application <a target="_blank" href="http://spa-auth.herokuapp.com/">here</a>
* Visit the <a href="https://github.com/naorye/spa-auth" target="_blank">GitHub repository</a>

I hope this article helped you understanding how to add authentication support for your single page application. Feel free to leave comments and questions!   
  
NaorYe