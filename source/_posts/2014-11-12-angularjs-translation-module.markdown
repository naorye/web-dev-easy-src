AngularJS Translation Module


In this tutorial we will write an AngularJS module that provides a simple and extensive solution for translations and internationalization (i18n) that a project needs. At the end of this article, our translation module will contain one service that is able to translate text according to translation table and one directive that provides translations to DOM attributes. Our module will also allow the user to change the language during runtime and re-translate all texts.

First, let's create a new module. I'll name it 'ny.translation' and it will have no dependencies:
```javascript Create ny.translation module
angular.module('ny.translation', []);
```

## Translation Table
In order to be able to translate, we have to support a translation table. A translation table is a key-value object where it's first level is the language code. For example:
```javascript Translation table
{
    'en': {
        'hello': 'Hello {{ name }}!',
        'navigation': {
            'articles': 'Articles',
            'images': 'Images',
            'authors': 'Authors'
        }
    },
    'es': {
        'hello': 'Hola {{ name }}!',
        'navigation': {
            'articles': 'Artículos',
            'images': 'Imágenes',
            'authors': 'Autores'
        }
    },
    'fr': {
        'hello': 'Bonjour {{ name }}!',
        'navigation': {
            'articles': 'Articles',
            'images': 'Images',
            'authors': 'Auteurs'
        }
    }
}
```
As you can see the translation table also support nested keys. For the key 'nvigation.authors', a French user will get the string 'Auteurs' where a Spanish guy will get the string 'Autores'. Moreover, our values can contain arguments. Later on you will see how we use <a href="https://docs.angularjs.org/api/ng/service/$interpolate" target="_blank">Angular's $interpolate service</a> in order to combine arguments in a translation string.

## $translate service
Now that we know what is a translation table, we can create the translation service. This service has several responsibilities:
1. Load a translation table (as an arguments or by url).
2. Determines the default language according the browser (with ability to change it).
3. Translate a text.
4. Support interpolation of texts.
4. Cause re-translating of all texts in case the user changes language.

### Initialize $translate and Loading a Translation Table
The $translate service has an initialize method which gets a translation table or a url as a parameter. This method loads the translation table and stores a reference to it. In case of providing a url, it has to contain an interpolation of the `lang-code` parameter (`http://www.webdeveasy.com/translation?lang={{ lang-code }}`) so that our service will load only the needed translation.
```javascript initialize method
angular.module('ny.translation').factory('$translate', ['$q', '$http', function($q, $http) {

    var translationTable = null,
        readyPromise = null,
        defaultLangCode = null;

    function getSystemLanguage() {
        var langCode = window.navigator.userLanguage || window.navigator.language,
        return langCode.split('-')[0];
    }

    function loadByUrl(url, langCode) {
        url = url.replace('{{ lang-code }}', langCode || defaultLangCode);
        return $http.get(url);
    }

    function initialize(tableOrUrl, langCode) {
        defaultLangCode = langCode || getSystemLanguage();
        if (angular.isObject(tableOrUrl)) {
            translationTable = tableOrUrl;
            readyPromise = $q.when();
        } else if (angular.isString(tableOrUrl)) {
            readyPromise = loadByUrl(defaultLangCode)
                .then(function(data) {
                    translationTable = data;
                });
        }
    }

    return {
        initialize: initialize
    };
}]);
```
The initialize method gets a translation table or a url and a language code as a parameters and initialize the `translationTable` variable. In case the language code wasn't provided, the system language is used. Another thing is the `readyPromise` which gets fulfilled when `translationTable` is ready.   
In order to use this translation module, the user has to call the initialize method in a run block:
```javascript initialize $translate service
appModule.run(['$translate', function($translate) {
    $translate.initialize('http://www.webdeveasy.com/translation?lang={{ lang-code }}', 'en');
}]);

### Translation and Interpolate Texts
The most useful method our `$translate` service exposes is the `get(key, params, callback)` method that responsible for the translation. This method also supports interpolation.
```javascript $translate.get(key, params, callback) implementation
angular.module('ny.translation').factory('$translate', ['$q', '$http', function($q, $http) {
    ....
    ....
    ....
    function get() {
        var key = '',
            params = {},
            callback = angular.noop;
        switch (arguments.length) {
            case 3:
                if (angular.isFunction(arguments[1])) {
                    params = arguments[2];
                } else if (angualr.isObject(arguments[1])) {
                    callback = arguments[2];
                }
            case 2:
                if (angular.isObject(arguments[1])) {
                    params = arguments[1];
                } else if (angualr.isFunction(arguments[1])) {
                    callback = arguments[1];
                }
            case 1:
                key = arguments[0];
        }
        if (arguments.length === 1) {
            
        } else if (arguments.length === 3) {

        }
    }

    return {
        initialize: initialize
    };
```
key, params, callback
params and callback are optionals
What is params for?
What is callback for?
 It gets a key as parameter and returns the value string according to the translation table.