JAR
===
What is JAR? It is a self-contained JavaScript library that consists of its own ModuleLoader and a few basic modules (so far) that will ease the creation of *Classes*, *Interfaces* and *Mixins* by providing a simple abstraction layer. Classes support *inheritance*, *implementation of Interfaces* as well as differentiation between *$public* and *$private* properties and methods. There are also extensions of the native types *Object*, *Array* and *String*. Everything in JAR is only accessible through a handful of methods which wil hopefully make the library easy to understand and to use.

(To those who looked into the *jar.js*-file and wondered where the modules *jar.html.** and *jar.util.** are: They are not completed yet and will follow as soon as possible.)


Usage
---------
To use JAR, you only have to write the following line in the head of your HTML-document.
```html
    <script type="text/javascript" src="path/to/jar.js"></script>
```
That's it! You are done!  
You can now play with JAR in an inline-script or a custom js-file.

The ModuleLoader
--------------------------
What is so different about the ModuleLoader? Why not use an existing loader like requirejs?  
Because there are some cases that are not covered by such loaders:

* Module hierarchy tree:  
The ModuleLoader automatically creates a module hierarchy tree so that a module like *jar.lang* can be later accessed as <code>jar.lang</code> in javascript.

* Bundles:  
It is possible to define and import bundles like *jar.lang.** . This will import the module *jar.lang* and all its submodules. A bundle is defined in the module's properties.

* Automatic dependency-detection and complex dependency-definition:  
There are two kinds of dependencies - implizit dependencies like *jar* for *jar.lang* and explizit dependencies. Explizit dependencies are declared in the module itself. To see how it works, just look into the existing modules.  
Some examples for explizit dependencies:

 * String:
```js
        JAR.register({
            MID: "someBundle.Module",
            deps: "anotherBundle.Module"
        }, function(anotherBundleModule) { // has one dependency in another bundle
            var someBundle = this; // implizit
            ...
        });

        JAR.register({
            MID: "someBundle.Module",
            deps: "anotherBundle.*"
        }, function(anotherBundle) { // has a bundle as dependency
            ...
        });

        JAR.register({
            MID: "someBundle.Module",
            deps: ".Module2"
        }, function(Module2) { // has one dependency in the same bundle
            var someBundle = this;
            someBundle.Module2 === Module2 // true
            ...
        });
```
 * Array:
```js
        JAR.register({
            MID: "someBundle.Module",
            deps: ["anotherBundle.Module", "anotherBundle.Module2"]
        }, function(anotherBundleModule, anotherBundleModule2) { // has more dependencies in another bundle
            ...
        });

        JAR.register({
            MID: "someBundle.Module",
            deps: [".Module2", ".Module3"]
        }, function(Module2, Module3) { // has more dependencies in the same bundle
            ...
        });
```
 * Object:
```js
        JAR.register({
            MID: "someBundle.Module",
            deps: {anotherBundle: [".", "Module", "Module2"]}
        }, function(anotherBundle, anotherBundleModule, anotherBundleModule2) { // has more dependencies in another bundle
            ...
        });
```

The different dependency-declarations can be combined like in the last example ( *Object*, *Array* )

Configuration
-------------------
You can configure JAR through this line,  
```js
JAR.configure(options);
```
where <code>options</code> includes one of the following options:

* basePath (the path to where the jar folder lies - default: *js*)
* bundle (an Array of modules to import  with <code>JAR.$import("*");</code> - default: [])
* cache ( *false* prevents caching of the files - default: *true*)
* debug (turn debugging on or off - default: *false*)
* debugMode (stdout if debugging is turned on *console/html* - default: *console*)
* globalAccess (root-modules can be used in the global namespace. This may be useful in developement - default: *false*)
* waitForTimeout (seconds to wait until the ModuleLoader aborts the loading of a module - default: *10*)

You can also define custom configurations that can be read via <code>jar.getConfig(option);</code>.

Examples
--------------
```js
JAR.$import("jar.lang.Class"); // import the module

JAR.main(function() { // waits for all the modules to be loaded
    var Class = this.jar.lang.Class; // this !== window
    var RO = Class("ReadOnly", { // create a Class
        $privileged: { // privileged methods have access to private methods/properties
            constructor: function(value) {
                value && (this._value = value);
            },
            
            getValue: function() { // can get value
                return this._value;
            }
        },
        
        $private: { // not accessible from the outside
            _value: "default"
        }
    });

    var RW = Class("ReadWrite", {
        $public: { // doesn't need private access
            constructor: function(value) {
                this.$super(value); // calls the constructor of the SuperClass - this.$super is only available if the method is overwritten
            }
        },

        $privileged: {
            setValue: function(value) { // can set value
                this._value = value;
            }
        }
    }).extendz(RO); // inherit from RO

    var ro = new RO();
    ro.getValue() // "default"
    ro.setValue("custom") // error
    ro._value // undefined

    var rw = new RW("notDefault");
    rw.getValue() // "notDefault"
    rw.setValue("custom")
    rw.getValue() // "custom"
    rw._value // undefined

    ro.constructor === RO // false - important!
    ro.Class === RO // true
    ro.getHash() // unique hash like "Object #<ReadOnly#...>"
    RO.getClassName() // "ReadOnly"
    RO.getHash() // unique hash like "Class #<ReadOnly#...>"
    RO.getSubClasses()[0] === RW // true
    RW.getSuperClass() === RO // true
    RO.getInstances()[0] === ro // true
    RO.getInstances()[1] === rw // true - inheritance
    RW.getInstances()[0] === rw // true
    ro instanceof RO // true
    ro instanceof RW // false
    rw instanceof RO // true - inheritance
    rw instanceof RW // true
});
```
Copyright and licensing
----------------------------------

Copyright (c) 2013 Holger Haas 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
