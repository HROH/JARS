# JARS

What is JARS ? It is an opinionated but still highly configurable module loader similar to requirejs, that also introduces some new concepts for how modules should be handled to make them more flexible.
Everything in JARS is only accessible through a handful of methods which will hopefully make the library easy to understand and to use.

Though this library should work in all modern browsers (and even ie6+), it is not recommended for production use.
It is merely thought of as a learning practice.
Some of the used features may go against common best practices or just be outdated considering the latest development in es6+.

## Usage

To use JARS, you only have to write the following line in the head of your HTML - document.
```html
<script data-main="entryModuleName" type="text/javascript" src="path/to/jars.js"></script>
```
That's it! You are done!  
You can now play with JARS in an inline-script or a custom javascript file.

## Modules and bundles

To be able to properly talk about how JARS works, there are a few concepts that have to be explained first.

### Modules

Like in any other module loader you can compose your application from **modules**. In JARS these **modules** have to be named, e.g. <code>'async'</code> or <code>'async.Promise'</code>. You can define a **module** like this:
```js
JARS.module('module').$import(dependencies).$export(function(dep1, dep2, ...) {
    // module code goes here
    return moduleExports;
});
```

### Coremodules and Submodules

You might have noticed some similarities between the example **modules** above. That is because they have a specific relationship. <code>'async.Promise'</code> is a **submodule** to <code>'async'</code> which in turn is a **coremodule** to the former. The relationship is pretty straightforward - the **coremodule** is always an implicit dependency to the **submodule**, while the **submodule** can never be a dependency to a **coremodule**. A **coremodule** can have as many **submodules** as you want and those **submodules** can even have their own **submodules**. They also translate one-to-one to namespaces in your code.

### Bundles

A **bundle** is a collection of a **coremodule** and all its ** submodules**. You can define a bundle like this:
```js
JARS.module('async', ['Promise']).$import(...).$export(...);
```
If you are not importing or exporting anything you can als just write:
```js
JARS.moduleAuto('async', ['Promise']);
```
Now you can import this **bundle** in other **modules** using <code>.*</code> at the end like this:
```js
JARS.module('module').$import('async.*').$export(function(async) {
    // async gives you access to all the modules in a bundle
    // as long as the coremodule doesn't export a primitive
    var Promise = async.Promise;
});
```
A **bundle** can also have **subbundles**. You can just refer to them in the bundle notation like this:
```js
JARS.moduleAuto('bundle', ['subbundle.*']);

// and in 'bundle.subbundle'
JARS.moduleAuto('bundle.subbundle', ['Module1', 'Module2']);

// loads 'bundle', 'bundle.subbundle', 'bundle.subbundle.Module1', 'bundle.subbundle.Module2'
JARS.module('module').$import('bundle.*').$export(...);
```

## Configuration

You can configure JARS like this:,
```js
JARS.configure(option, value);
// or
JARS.configure(options);
// or
JARS.configure([options, ...]);
```
where <code>options</code> includes one of the following:

* **debugging {Object|Boolean}** (Shortcut for defining <code>modules.config</code> on all modules)  
If you just pass a boolean value, it has the same effect as the <code>debugging.debug</code> option.
Or you can provide an object with the following options:
  * **context {Object|Array|String}** (define a comma-separated list of loggers that are allowed to log messages)  
  You can also define an Object with include- and exclude-properties.

  * **debug {Boolean}** (turn debugging on or off - default: <code>false</code>)

  * **level {String|Number}** (The level that still should be logged - default: <code>System.LogLevels.ALL</code>)  
  E.g. a level of <code>'warn'</code> will log all messages with equal or higher priorities (warn, error).

  * **mode {String}** (stdout if debugging is turned on - default: <code>'console'</code>)  
 You can provide your own transport via <code>System.Transports.add(mode, Transport)</code>
* **environment {String}** (switch between environments)

* **environments {Object}** (define environments, that you can switch between)

  ```js
  JARS.configure('environments', {
      myEnvironment: {
          // environment configuration
      }
  });

  // later in your code
  JARS.configure('environment', 'myEnvironment');
  ```

* **globalAccess {Boolean}** (root-modules can be accessed over the namespace <code>JARS.mods</code>. This may be useful in developement - default: <code>false</code>)

* **main {String}** (define the entry module of your application)  
It will be automatically loaded.

* **modules {Object|Array}** (configure modulespecific options like <code>basePath</code> or <code>recover</code>)  
You can customize the following options for your modules:
  * **basePath {String}** (path to the rootdirectory of your modules - default: current directory)

  * **cache {Boolean}** (<code>false</code> prevents caching of the files - default: <code>true</code>)

  * **checkCircularDeps {Boolean}** (<code>true</code> causes the loader to check for circular dependencies - default: <code>false</code>)  
  Can be slow in larger projects, so only use this feature with caution or if your app is not loading properly and you don't get any error messages.

  * **config {Object}** (options for configuring a module)  
  You can read the config using the <code>'System!'</code> plugin interceptor in your dependencies.
  It will give you a <code>config</code> object that you can access for the option you need. All <code>config</code>s inherit from their parent <code>config</code>s.

  * **dirPath {String}** (path to the module)  
  By default the dirPath will be created by using the name of the module.
  E.g. the module <code>lang</code> is located at <code>'[basePath]/lang/lang.js'</code> (if the module starts in lowercase it gets its own directory)
  and the module <code>lang.Class</code> is located at <code>'[basePath]/lang/Class.js'</code>.
  If you define a new dirPath you can adjust the structure of your directories to <code>'[basePath]/([dirPath]/)[fileName].[extension]'</code>.

  * **extension {string}** (change the file type of your module - default: <code>'js'</code>)

  * **fileName {String}** (change the filename of your module)

  * **minify {Boolean}** (should the Loader load a minified version - automatically appends **.min** to every filename)

  * **recover {Object}** (define a recover-configuration with the same options)  
  If the loader fails to load a module and finds a recover it will attempt to load the module with the new options.  
  Recovers can be nested as deep as you want. Options that are not redefined in a recover still remain active. Pass <code>null</code> to delete them.  
  If you use the <code>recover</code>-option you should set the <code>timeout</code> as low as possible (0.5 seconds).

  * **timeout {Number}** (seconds to wait until the Loader aborts the loading of a module - default: <code>5</code>)

  * **versionPath {String}** (this will be appended to the directory path)

  You can also pass the additional options:
  * **restrict {Object|Array|String}** (defines the modules that are affected by this configuration similar to the dependency-declaration in <code>JARS.module(moduleName, [bundle]).$import(dependencies)</code>).

  * **context {String}** (the context of the modules that you want to configure - default: <code>'default'</code>)

  ```js
  JARS.configure('modules', {
      restrict: 'lang.*', // restrict configuration to all the modules under 'lang'
      basePath: 'http://localhost/libs',
      minify: true,
      recover: {
          basePath: 'http://localhost/backup'
      }
  });

  // This will load the module from 'http://localhost/libs/lang/Object.min.js'
  // or from 'http://localhost/backup/lang/Object.min.js' on failure
  JARS.$import('lang.Object');
  ```

 Note that these configurations inherit options from their parent (e.g. lang -> lang.* -> global config). So if there exists no configuration for a specific module the loader will look for a configuration on a higher or - if you omit the restriction - on the global level.

## Interceptors

JARS includes the concept of interceptors.
They basically intercept and interact with required modules before they are passed to the requiring module.
You could say, it is an abstraction of what is known as "[plugins](http://requirejs.org/docs/plugins.html)" in requirejs.
The syntax for using an interceptor is <code>moduleName + interceptorType + data</code>.
JAR comes with two default interceptors for now:

### PluginInterceptor (interceptorType: **"!"**)  
Like already said, this interceptor is used  similar to  the implementation in requirejs,
but it has a slightly different purpose and is not restricted to resources only.
It just gives control to the required module, which can resume or abort loading and pass custom data to the requiring module.
The only requirement to use the interceptor on a module is, that the required module has method called <code>plugIn(pluginRequest)</code> defined as meta data.
```js
JARS.module('test').meta({
    plugIn: function(pluginRequest) {
        // ...
    }
});
```
The <code>pluginRequest</code> has the following information:
  * **requestor {JARS.internals.Module}** the requiring module

  * **info {Object}** the passed in interception info

  * **success([value]) {Function}** call this method to resume loading.  
  If you pass in a value, the requiring module will receive it instead of the originally required module. Calls <code>pluginRequest.$export(function() {return value;})</code>

  * **fail([error]) {Function}** calling this method will abort loading and show the error or a default message

  * **$import(modules) {Function}** import additional modules as dependencies of the requestor
  * **$export(provide) {Function}** export the return value of <code>provide(...modulesExports)</code> that the requestor will receive. The content of the requested module can be accessed through <code>this</code>.

  * **$importAndLink(modules, provide) {Function}** this is a shorthand for calling <code>pluginRequest.$import(modules).$export(provide)</code>.

### PropertyInterceptor (interceptorType: **"::"**)  
It tries to find a property that equals the passed data on the required module.
If it finds such a property, the requiring module will receive its value instead of the required module.
If the property doesn't exist, loading is aborted and an error is logged.

 Without interceptor:
```js
JARS.module('someBundle.Module').$import('System').$export(function(System) {
    var isString = System.isString,
        isFunction = System.isFunction;
        // ...
});
```

 With interceptor:
```js
JARS.module('someBundle.Module').$import({
    System: ['::isString', '::isFunction']
}).$export(function(isString, isFunction) {
        // ...
});
```

## Main entry

The entry point for your program is a module, that can be configured as an option (see [Configuration](#configuration)).

```js
//In entryModule.js
JARS.module('entryModule').$import('some.Module').export(function(someModule) {
    //Code to setup project goes here
});
```
```html
<!-- In index.html -->
<script data-main="entryModule" type="text/javascript" src="path/to/jars.js"></script>
<!-- or -->
<script type="text/javascript" src="path/to/jars.js">
    JARS.main('entryModule');
    //or
    JARS.configure('main', 'entryModule');
</script>
```

## Versioning

This project follows SemVer guidelines.
There are no fixed milestones set for now, so I will update the minor version when I feel that I completed some bigger changes in the codebase.
I will also not make any patches before version 1.0.0 because everything is still unstable.

The latest version is 0.3.0.

## Copyright and licensing

Copyright(c) 2018 Holger Haas

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
