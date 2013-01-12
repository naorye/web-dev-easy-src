---
comments: true
date: 2012-09-17 02:47:52
layout: post
slug: yeoman-review
title: Yeoman Review
wordpress_id: 42
categories:
- Frameworks and Tools
tags:
- boilerplate
- Yeoman
---

Today I was informed about [Yeoman](http://www.yeoman.io) which is (according to Yeoman website) a new set of tools, libraries and workflows that can help developers to quickly build beautiful, compelling web. I decided to check this out.

<!-- more -->

Notice that Yeoman is working only under iOS and Linux, so if you are a Windows user I wholeheartedly recommend [Ubuntu](http://www.ubuntu.com/). In order to install Yeoman open Terminal and execute the following command:

    
    $ curl -L get.yeoman.io | bash


At first, Yeoman verifies the existence of all it's dependencies (more info about that [here](https://github.com/yeoman/yeoman/wiki/Manual-Install)) and asks you to install what does not exists.
It takes some time to complete installing all the missing dependencies (in case you don't have them), an automatic installer would save a lot of time, but once you got them you are ready to use Yeoman!

[![Yeoman Requirements](http://www.webdeveasy.com/wp-content/uploads/2012/09/yeoman_requirements.png)](http://www.webdeveasy.com/yeoman_review/yeoman_requirements.png)

In order to create a new app, execute the command:

    
    $ yeoman init


Yeoman will ask about the libraries you wish to include in the new app and then, initialize it according to the selection. Yeoman is integrated with [Twitter Bower](http://github.com/twitter/bower): “Bower is a package manager for the web. Bower lets you easily install assets such as images, CSS and JavaScript, and manages dependencies for you”. That way Yeoman knows to take the latest updated version of a desired library (such as [jQuery](http://http://jquery.com/), [ember](http://emberjs.com/), [Twitter Bootstrap](http://twitter.github.com/bootstrap/) and many more). Along the new application, Yeoman also creates unit tests using [mocha](http://visionmedia.github.com/mocha/). After easily initialize your app you are ready to open your favorite text editor/IDE and start writing your new startup.

One nice feature Yeoman has is the "changes watcher". Whenever you like to see preview of your development you can execute the following command:

    
    $ yeoman server


This command launches the app in the browser and starts watching for changes. Each change you'll do in your code (markup, JavaScript or CSS) will refresh the preview and be reflected in your browser immediately. There are many more nice features in Yeoman but I think now it is your time to check things up.

In this article I tried to get you introduced to Yeoman and explained a little bit about it's abilities. You can find more information at the Yeoman website. Hope you'll find this article useful, feel free to ask any question you have.
