JAR
===
What is JAR ? It is a self - contained JavaScript library that consists of its own Loader and a few basic modules (so far) that will ease the creation of <code>Classes</code>, <code>Interfaces</code> and <code>Mixins</code> by providing a simple abstraction layer.
Classes support inheritance, implementation of Interfaces as well as differentiation between public and protected (<code>_$</code>) properties and methods.
There are also extensions of the native types <code>Object</code>, <code>Array</code>, <code>Function</code> and <code>String</code>.
Everything in JAR is only accessible through a handful of methods which wil hopefully make the library easy to understand and to use.

(To those who looked into the jar.js-file and wondered where the modules <code>jar.async.\*</code>, <code>jar.html.\*</code> and <code>jar.util.\*</code> are: They are not completed yet and will follow as soon as possible.)

Though this library should work in all modern browsers (and even ie6+), it is not recommended for production use.
It is merely thought of as a learning practice.
Some of the used features may go against common best practices.
This mainly applies to the fact that some of the native prototypes (even <code>Object.prototype</code>) are extended (though sandboxed).

Usage
---------
To use JAR, you only have to write the following line in the head of your HTML - document.
```html
 <script type="text/javascript" src="path/to/jar.js"></script>
```
That's it! You are done!  
You can now play with JAR in an inline-script or a custom js-file.

The Loader
--------------------------
What is so different about the Loader? Why not use an existing loader like requirejs?  
Because there are some cases that are not covered by such loaders:

* Module hierarchy tree:  
The Loader automatically creates a module hierarchy tree so that a module like <code>jar.lang</code> can be later accessed as <code>jar.lang</code> in javascript.

* Bundles:  
It is possible to define and import bundles like <code>jar.lang.\*</code> .
This will import the module <code>jar.lang</code> and all its submodules.
A bundle is defined in the module's properties.

* Automatic dependency-detection and complex dependency-definition:  
There are two kinds of dependencies - implizit dependencies like <code>jar</code> for <code>jar.lang</code> and explizit dependencies.
Explizit dependencies are declared in the module itself.
To see how it works, just look into the existing modules.  
Some examples for explizit dependencies:

 * String:
 ```js
        JAR.register({
            MID: 'someBundle.Module',
            deps: 'anotherBundle.Module'
        }, function(anotherBundleModule) { // has one dependency in another bundle
            var someBundle = this; // implizit
            ...
        });

        JAR.register({
            MID: 'someBundle.Module',
            deps: 'anotherBundle.*'
        }, function(anotherBundle) { // has a bundle as dependency
            ...
        });

        JAR.register({
            MID: 'someBundle.Module',
            deps: '.Module2'
        }, function(Module2) { // has one dependency in the same bundle
            var someBundle = this;
            someBundle.Module2 === Module2 // true
            ...
        });
 ```

 * Array:
 ```js
		JAR.register({
            MID: 'someBundle.Module',
            deps: ['anotherBundle.Module', 'anotherBundle.Module2']
        }, function(anotherBundleModule, anotherBundleModule2) { // has more dependencies in another bundle
            ...
        });

        JAR.register({
            MID: 'someBundle.Module',
            deps: ['.Module2', '.Module3']
        }, function(Module2, Module3) { // has more dependencies in the same bundle
            ...
        });
 ```

 * Object:
 ```js
        JAR.register({
            MID: 'someBundle.Module',
            deps: {anotherBundle: ['.', 'Module', 'Module2']} // '.' is a special symbol that refers to the module on the lefthand side
        }, function(anotherBundle, anotherBundleModule, anotherBundleModule2) { // has more dependencies in another bundle
            ...
        });
 ```

The different dependency-declarations can be combined like in the last example (Object, Array)

Configuration
-------------------
You can configure JAR through this line,
```js
JAR.configure(options);
```
or
```js
JAR.configure(option, value);
```
where <code>options</code> includes one of the following:

* **checkCircularDeps {Boolean}** (<code>true</code> causes the Loader to check for circular dependencies - default: <code>false</code>)
Can be very slow, so only use this feature if your app is not loading properly and you don't get any error messages.
* **createDependencyURLList {Boolean}** (specify <code>true</code> to let the Loader create a list of all dependencies when they are loaded - default: <code>false</code>)
Maybe useful in a buildstep using something like phantomjs. You can get the list by calling <code>JAR.getModulesURLList(callback)</code>.
* **debugging {Object|Boolean}** (Shortcut for defining <code>modules.config</code>)
 * **context {Object|Array|String}** (define a comma-separated list of loggers that are allowed to log messages)
 You can also define an Object with include- and exclude-properties.
 * **debug {Boolean}** (turn debugging on or off - default: <code>false</code>)
 * **level {String|Number}** (The level that still should be logged - default: <code>System.Logger.logLevels.ALL</code>)
 A level of **warn** will log all messages with equal or higher priorities (warn, error).
 * **mode {String}** (stdout if debugging is turned on <code>console, ...</code> - default: <code>console</code>)  
 You can provide your own Debugger via the <code>System.Logger.addDebugger(debuggerSetup)</code> function in the <code>System.Logger</code>-module
* **environment {String}** (switch between environments)
* **environments {Object}** (define environments, that you can switch between)
    ```js
	JAR.configure('environments', {
		myEnvironment: function(configure) {
			configure( /*...configure environment...*/ );
		}
	});
	
	//later in your code
	JAR.configure('environment', 'myEnvironment');
    ```
* **globalAccess {Boolean}** (root-modules can be accessed over the namespace <code>JAR.mods</code>. This may be useful in developement - default: <code>false</code>)
* **main {String}** (define the main-file of your application)
* **modules {Object}** (configure modulespecific options like <code>baseUrl</code> or <code>recover</code>)  
You can customize the following options for your modules:
 * **baseUrl {String}** (url to the rootdirectory of your modules - default: current directory)
 * **cache {Boolean}** (<code>false</code> prevents caching of the files - default: <code>true</code>)
 * **config {Object}** (options for configuring a module)
 You can read the config using the <code>"System!"</code>-plugin-interceptor in your dependencies.
 It will give you a config-function that you can ask for the option you need.
 * **dirPath {String}** (path to the module)  
 By default the dirPath will be created by using the name of the module.
 E.g. the module <code>jar.lang</code> is located at [baseUrl]/jar/lang/lang.js (if the module starts in lowercase it gets its own directory)
 and the module <code>jar.lang.Class</code> is located at [baseUrl]/jar/lang/Class.js.
 If you define a new dirPath you can flatten the structure of your directories
 * **fileName {String}** (change the filename of your module)
 * **minified {Boolean}** (should the Loader load a minified version - automatically appends **.min** to every filename)
 * **recover {Object}** (define a recover-configuration with the same options)  
 If the Loader fails to load a module and finds a recover it will attempt to load the module with the new options.
 Recovers can be nested as deep as you want. Options that are not redefined in a recover still remain active.
 If you use the <code>recover</code>-option you should set the <code>timeout</code> as low as possible (1 second).
 * **timeout {Number}** (seconds to wait until the Loader aborts the loading of a module - default: <code>5</code>)
 * **versionSuffix {String}** (this will be appended to the filename)  
 This may be useful if you switch from an older to a newer version.
 It is not recommended or possible to load two different versions of one module.
 
 You can also pass the additional option <code>restrict</code> which defines the modules that are affected by this configuration.
 This can be a String, an Array or an Object similar to the dependency-declaration in <code>JAR.register(properties, factory)</code>.
 
 ```js
 JAR.configure('modules', {
    restrict: 'jar.lang.*', // restrict configuration to all the modules under 'jar.lang'
    baseUrl: 'http://localhost/libs/',
    minified: true
 });
    
 // This will load the module from 'http://localhost/libs/jar/lang/Object.min.js'
 JAR.$import('jar.lang.Object');
 ```
 
 Note that these configurations are semi-transparent.
 So if there exists no configuration for a specific module the Loader will look for a configuration on a higher or - if you omit the restriction - on the global level.
* **supressErrors {Boolean}** (whether thrown errors in a <code>JAR.main</code>-block should be caught - default: <code>false</code>)

Examples
--------------
```js
JAR.$import('jar.lang.Class'); // import the module (also accepts an Array or Object)

JAR.main(function(Class) { // waits for all the modules to be loaded
    Class === this.jar.lang.Class; // this !== window
    
    var RO = Class('ReadOnly', { // create a Class
        $: { // privileged methods have access to protected methods/properties
            constructor: function(value) {
                value && (this._$value = value); // protected methods/properties get prefixed with _$
            },
            
            getValue: function() { // can get value
                return this._$value;
            }
        },
        
        _$: { // not accessible from the outside
            value: 'default'
        }
    });

    var RW = Class('ReadWrite', {
        // doesn't need protected access
        constructor: function(value) {
            this.$super(value); // calls the constructor of the SuperClass - this.$super is only available if the method is overridden
        },
        
        $: {
            setValue: function(value) { // can set value
                this._$value = value;
            }
        }
    }).extendz(RO); // inherit from RO (you can use RO.createSubClass(name, {...}) alternatively

    var ro = new RO();
    ro.getValue() // 'default'
    ro.setValue('custom') // error
    ro._$value // undefined

    var rw = new RW('notDefault');
    rw.getValue() // 'notDefault'
    rw.setValue('custom')
    rw.getValue() // 'custom'
    rw._$value // undefined

    ro.constructor === RO // true
    ro.Class === RO // true
    ro.getHash() // unique hash like 'Object #<ReadOnly#...>'
    RO.getClassName() // 'ReadOnly'
    RO.getHash() // unique hash like 'Class #<ReadOnly>'
    RO.getSubClasses()[0] === RW // true
    RW.getSuperClass() === RO // true
    RO.getInstances()[0] === ro // true
    RO.getInstances(true /*get instances of subclasses too*/)[1] === rw // true - inheritance
    RW.getInstances()[0] === rw // true
    ro instanceof RO // true
    ro instanceof RW // false
    rw instanceof RO // true - inheritance
    rw instanceof RW // true
});
```

Copyright and licensing
----------------------------------

Copyright(c) 2013-2015 Holger Haas

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.