---
layout: post
styles: [data-table]
slug: optimize-requirejs-projects
title: Optimize (Concatenate and Minify) RequireJS Projects
spot: webdevelopment
date: 2013-04-19 07:32
comments: true
categories:
- RequireJs
- JavaScript
tags:
- RequireJs
- JavaScript
- almond
- pekan
- r.js
---

This article will demonstrate you how to concatenate and minify projects that are based on RequireJS. In this article I'll use several tools that require Node.js. So, if you don't have Node.js yet, install it <a target="_blank" href="http://nodejs.org/">here</a>.
<!-- more -->

Motivation
----------
A lot has been written already about RequireJS. This tool allows you to easily separate your JavaScript code into several modules and by this keep your code modular and easy to maintain. Then, you get many JavaScript files that have dependency relation. By adding one script reference to RequireJS in your html file, you can load all the required scripts for your page.   
Still, in production, this is a bad practice to leave all JavaScript files separated. Making many requests, no matter how small the requested files are, take time. This time can be saved by concatenating scripts that reduce the number of requests and save the loading time.   
Another technique to save loading time is to reduce the size of the requested files, a small file can be delivered faster. This process is called <a target="_blank" href="http://en.wikipedia.org/wiki/Minification_%28programming%29">minification</a> and it is done by carefully changing the script's code without changing its behavior and functionality. Such changes can be: removing unnecessary characters like spaces, mangling variables and methods names and so on.
This process of concatenation and minification is called optimization. In addition to JavaScript files optimization, the same methods are used to optimize CSS files.   
RequireJS has two main methods: define() and require(). These methods basically have similar declaration and they both know to load dependencies and then execute a callback function.
Unlike require(), define() is used to store code as a named module. Therefore the define()'s callback function should return a value to define the module. Such modules are called <a target="_blank" href="http://requirejs.org/docs/whyamd.html">AMD</a> (Asynchronous Module Definition).   

If you are not familiar with RequireJS or didn't fully understand what I wrote - don't worry. An example is about to come.   

JavaScript Application Optimization
-----------------------------------
In this section I will demonstrate the optimization of Addy Osmani's <a target="_blank" href="http://todomvc.com/dependency-examples/backbone_require/">TodoMVC Backbone.js + RequireJS project</a>. Since the TodoMVC project contains many implementations of TodoMVC in different frameworks, I downloaded version 1.1.0 and draw out the Backbone.js + RequireJS application. Download the application from
<a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc.zip">here</a> and extract the zip file. The extracted todo-mvc directory will be our example root path and from now on I'll refer to this directory as &lt;root&gt;.   
If you'll look on &lt;root&gt;/index.html file, you will see it contains only one script tag (and another one if you use Internet Explorer):
```html index.html scripts refrences
<script data-main="js/main" src="js/lib/require/require.js"></script>
<!--[if IE]>
    <script src="js/lib/ie.js"></script>
<![endif]-->
```
In fact, the only tag required for loading the whole project's scripts is the require.js script tag. If you'll launch <a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc/">the project</a> in your browser and look under the network tab of your favorite inspection tool, you will notice that your browser has also loaded other JavaScript files:   
{% img right /code/optimize-requirejs-projects/loaded-js-files-list.png 'Loaded JavaScript Files List' 'Loaded JavaScript Files List' %}   
All the scripts marked inside the red square were loaded by RequireJS.   

To optimize the project we will use <a target="_blank" href="http://requirejs.org/docs/optimization.html">RequireJS Optimizer</a>. Follow the <a target="_blenk" href="http://requirejs.org/docs/optimization.html#download">download instructions</a>, get r.js and copy it to the &lt;root&gt; directory. jrburke's <a target="_blank" href="https://github.com/jrburke/r.js">r.js</a> is a command line tool that can run AMD based projects, but what is more important, it includes the RequireJS Optimizer which allows us to concatenate and minify scripts.  
RequireJS Optimizer has many usages. It can optimize single JavaScript or single CSS file, it can optimize a whole project or only part of it as well as multi-page application. It can also use different minification engines or no minification at all, and so on. This article has no intention to cover all the possibilities of RequireJS Optimizer, but to demonstrate a usage.   

As I mentioned earlier, we will use Node.js in order to run the optimizer. The following command runs it:
```bash Run RequireJS Optimizer
$ node r.js -o <arguments>
```
There are two ways to supply arguments to the optimizer. One way is to specify arguments on the command line:
```bash Arguments on the command line
$ node r.js -o baseUrl=. name=main out=main-built.js
```
Other way is to specify a build profile file (relative to the execution folder) that contains the arguments:
```bash Arguments on build profile file
$ node r.js -o build.js
```
And build.js content:
```javascript Arguments on build profile file
({
    baseUrl: ".",
    name: "main",
    out: "main-built.js"
})
```
I think a build profile file is more readable than command line arguments so I'll use this method. Let's create our &lt;root&gt;/build.js file and see which arguments it contains:
```javascript &lt;root&gt;/build.js
({
    appDir: './',
    baseUrl: './js',
    dir: './dist',
    modules: [
        {
            name: 'main'
        }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimizeCss: 'standard',
    removeCombined: true,
    paths: {
        jquery: 'lib/jquery',
        underscore: 'lib/underscore',
        backbone: 'lib/backbone/backbone',
        backboneLocalstorage: 'lib/backbone/backbone.localStorage',
        text: 'lib/require/text'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        backboneLocalstorage: {
            deps: ['backbone'],
            exports: 'Store'
        }
    }
})
```

Understanding all the configurations of RequireJS Optimizer is not the aim of this article, but I want do describe the arguments I used:

Argument            | Description |
--------            | ----------- |
appDir              | The directory that contains the application (the &lt;root&gt; directory). All the files sitting under this directory will be copied from here to the dir argument.
baseUrl             | A path, relative to appDir, that represents the anchor path for finding files.
dir                 | This is the output directory which all the application files will be copied to.
modules             | Array that contains objects. Each object represents a module that should be optimize.
fileExclusionRegExp | Each file or directory that will be match to this regular expression will not be copied to our output directory. Since we located r.js and build.js under the application directory, we want the optimizer to exclude them. Therefore we set this argument to /&#94;(r|build)&#92;.js$/.
optimizeCss         | RequireJS Optimizer automatically optimizes our application's CSS files. This argument controls the CSS optimization settings. Allowed values: "none", "standard", "standard.keepLines", "standard.keepComments", "standard.keepComments.keepLines".
removeCombined      | If true, optimizer will remove concatenated files from the output directory.
paths               | Relative paths of modules.
shim                | Configure dependencies and exports for "browser globals" scripts, that do not use define() to declare the dependencies and set a module value.

For more information and for advanced usage of the RequireJS Optimizer, in addition to it's web page provided earlier, you can read the details of all the allowed optimizer configuration options <a target="_blank" href="https://github.com/jrburke/r.js/blob/master/build/example.build.js">here</a>.   

Now that we have the build file, lets run the optimizer. Go to the &lt;root&gt; directory and execute the command:

```bash Run optimizer
$ node r.js -o build.js
```
A new folder has created: &lt;root&gt;/dist. It is important to notice that the script &lt;root&gt;/dist/js/main.js now contains all it's combined and minified dependencies. Moreover, &lt;root&gt;/dist/css/base.css is also optimized.   
Running <a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc/dist/">the optimized project</a> launches the application which looks exactly like the non-optimized version. Inspecting the page network traffic will show that only two JavaScript files were loaded: 
{% img right /code/optimize-requirejs-projects/loaded-optimized-js-files-list.png 'Loaded Optimized JavaScript Files List' 'Loaded Optimized JavaScript Files List' %}   
RequireJs Optimizer reduced the amount of server scripts requests from 13 to 2 and reduced the total scripts size from 164KB to 58.6KB (both require.js and main.js).

Overhead
--------
Apparently, after the optimization is over, we don't need a reference to require.js because the scripts are no longer separated and all the dependencies were loaded.   
Still, the optimization process concatenated all our scripts and produced one optimized script file which contains many calls to define() and require(). Therefore, to allow the application work properly, define() and require() must be specified and 
implemented somewhere in our application.   
This issue causes a well known overhead: we always have to have any code that implement define() and require(). **This code is not part of our application and it exists only due to our infrastructure considerations.** This problem becomes even bigger when we want to develop a JavaScript library. Such libraries usually have small size comparing to RequireJS itself, and therefore including it in the library will cause a huge overhead.   

At the time of writing this article, there isn't any full solution for this overhead, but we can ease it using <a target="_blank" href="https://github.com/jrburke/almond">almond</a>. Almond is a minimalistic AMD loader which implements the RequireJS API, and so, instead of including the RequireJS implementation in our optimized code, we can include almond.   
Nowadays, I am working on an optimizer that will be able to optimize RequireJS applications without overhead, but this is still a new project so there is nothing to show yet.   

Download & Conslusion
---------------------

* <a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc.zip">Download</a> **unoptimized** TodoMVC Backbone.js + RequireJS project or <a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc/">See</a> it in action.
* <a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc-optimized.zip">Download</a> **optimized** TodoMVC Backbone.js + RequireJS project (located under dist folder) or <a target="_blank" href="../code/optimize-requirejs-projects/todo-mvc/dist/">See</a> it in action.

After reading this article, I believe you got a solid idea how to optimize your RequireJS application. I'll be glad to answer any question you have.   

Good Luck!   
NaorYe

