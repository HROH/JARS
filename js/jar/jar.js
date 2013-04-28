// JAVA Alike Renderer

(function(win, undefined) {
    "use strict";
    
    var doc = win.document,
        docElem = doc.documentElement,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice;
    
    var JAR = (function() {
        var locked, parsed, global,
            mainQueue = [];
        /**
         *
         * @param Function fn
         */
        function end(fn) {
            fn.apply(null, ROOT);
            locked = false;
        }
        
        var JAR = function() {
            locked = false;
            parsed = false;
        };
        
        JAR.fn = JAR.prototype = {
            constructor: JAR,
            /**
             * 
             * @param Function startFn
             * @param Function endFn
             * 
             */
            main: function(startFn, endFn) {
                var JAR = this;
                if(!locked) {
                    ModuleLoader.ready(function() {
                        locked = true;
                        if(Config.supressErrors) {
                            try {
                                log("start executing main...", "log");
                                startFn.call(ROOT);
                            }
                            catch(e) {
                                log((e.stack || e.message || "Error:\nError in JavaScript-code!") + "\nexiting...", "error");
                            }
                            finally {
                                end(endFn || function() {
                                    log("...done executing main", "log");
                                });
                            }
                        }
                        else {
                            startFn.call(ROOT);
                            locked = false;
                        }
                        if(mainQueue.length > 0) {
                            JAR.main.apply(JAR, mainQueue.shift());
                        }
                    });
                }
                else {
                    mainQueue.push([startFn, endFn]);
                }
            },
            /**
             * 
             * @param String moduleName
             * @param String basePath
             * 
             */
            $import: function(moduleName, basePath) {
                if(/^\*$/.test(moduleName)) {
                    var bundle = Config.bundle;
                    for(var i = 0, l = bundle.length; i < l; i++) {
                        ModuleLoader.$import(bundle[i], basePath);
                    }
                }
                else {
                    ModuleLoader.$import(moduleName, basePath);
                }
            },
            /**
             * 
             * @param Object props
             * @param Function fn
             * 
             */
            register: function(props, fn) {
                ModuleLoader.register(props, fn);
            },
            /**
             * 
             * @param Object config
             * 
             */
            configure: function(config) {
                for(var option in config) {
                    Config[option] = config[option];
                }
                if(!parsed && Config.parseOnLoad === true) {
                    parsed = true;
                    this.$import("jar.html.Parser");
                    this.main(function() {
                        log("start autoparsing document...", "log");
                        this.jar.html.Parser.parseDocument();
                        log("...end autoparsing document", "log");
                    });
                    locked = true;
                }
				if(!global && Config.globalAccess === true) {
					for(var module in ROOT) {
						win[module] = ROOT[module];
					}
					ROOT = win;
					global = true;
				}
            },
            /**
             * 
             * @param String name
             * @param Function func
             * 
             */
            func: function(name, func) {
                Functions.add(name, func);
            },
            
            version: "0.1.0"
        };
        
        return new JAR();
    })(),
	
    ROOT = {},
    
    Config = {
        basePath:		"js",
        bundle:			[],
        cache:			true,
        debug:			false,
        debugMode:		"console",
		globalAccess:	false,
        parseOnLoad:	false,
        supressErrors:	false,
        waitForTimeout:	10
    },
    
    SYSTEM = (function() {
		function roleTestSetup(roleDef, type) {
            return function(value) {
                return typeof value === type.toLowerCase() || (value && toString.call(value) === roleDef);
            };
        }
    
        var roles = ["Undefined", "String", "Number", "Boolean", "Array", "Arguments", "Object", "Function"],
            roleTests = {}, roleDef, objPartOne = "[object ", objPartTwo = "]",
            i = 0, l = roles.length, isArgs, isNumber;

        for(; i < l; i++) {
            roleDef = [objPartOne, roles[i], objPartTwo].join("");
            roleTests["is" + roles[i]] = roleTestSetup(roleDef, roles[i]);
        }
        
        isArgs = roleTests.isArguments;
        isNumber = roleTests.isNumber;
        
        roleTests.isNumber = function(value) {
			return isNumber(value) && !isNaN(value) && value !== Infinity && value !== -Infinity;
        };
        
        roleTests.isArguments = function(value) {
            return isArgs(value) || (roleTests.isNumber(value.length) && !roleTests.isFunction(value));
        };
        
        roleTests.isDefined = function(value) {
			return !roleTests.isUndefined(value);
        };
        
        roleTests.isNull = function(value) {
			return value === null;
        };
        
        roleTests.isDate = function(value) {
			return value instanceof Date;
        };
        
        roleTests.isRegExp = function(value) {
			return value instanceof RegExp;
        };

        return roleTests;
    })(),

    log = (function() {
        var even = false,
            debugWindow,
			debugWindowWidth = 640,
            debugWindowHeight = 480,
            noop = function() {},
            pseudoConsole = {
                log:	noop,

                debug:	noop,

                warn:	noop,

                error:	noop
            },
            modes = {
                console: (function() {
                    return win.console || pseudoConsole;
                })(),
                // TODO rewrite
                html: {
                    log: function(obj, depth) {
                        depth = depth || 0;
                        var prop;
                        
						even = !even;
                        if(depth === 0) {
							write('<div style="background-color:' + (even ? '#414141' : '') + '">');
                        }
                        if(SYSTEM.isString(obj)) {
							/* TODO replace */
                            obj = obj.replace(/(\".*?\")/gi, '<b style="color: lightblue;">$1</b>')
                                .replace(/(function\s*\(.*\))/g, '<i style="color: orange;">$1</i>')
                                .replace(/(\s+-{0,1}\d+)/g, '<i style="color: lime;">$1</i>')
                                .replace(/\[(.*?)\]/g, '<i style="color: yellow;">[</i>$1<i style="color: yellow;">]</i>')
                                .replace(/\S{0,1}([\-\+=\|!&]{1,3})\s+/g, ' <span style="font-weight: bolder; color: darkred;">$1</span> ')
                                .replace(/(true|false)/g, ' <span style="font-weight: bolder; color: darkgreen;">$1</span> ');
                            write('<code>' + obj + '<br></code>');
                        }
                        else if(SYSTEM.isNumber(obj)) {
                            write('<code style="color: violett;">' + obj + '<br></code>');
                        }
                        else if(SYSTEM.isArray(obj)) {
                            write('<code>Array:<br>');
                            for(prop = 0; prop < obj.length; prop++) {
                                write('\t' + prop + ' => ');
                                this.log(obj[prop], depth + 1);
                            }
                            write('</code>');
                        }
                        else if(SYSTEM.isObject(obj) && depth <= 1) {
                            write("<code>Object:<br>");
                            for(prop in obj) {
                                write(prop + " => ");
                                this.log(obj[prop], depth + 1);
                            }
                            write('</code>');
                        }
                        else if(SYSTEM.isFunction(obj)) {
                            this.log(Function.toString.call(obj) + "<br>", depth + 1);
                        }
                        else if(SYSTEM.isBoolean(obj)) {
                            write(obj + "<br>");
                        }
                        else {
                            write(obj + "<br>");
                        }
                        if(depth === 0) {
							write('</div>');
						}
                    },
                    //TODO write proper debug, warn, error
					warn: function(obj) {
						write('<div style="background-color: #ff730f">');
						this.log(obj, 1);
						write('</div>');
					},
					
					error: function(obj) {
						write('<div style="background-color: #ff370f">');
						this.log(obj, 1);
						write('</div>');
					},
					
					debug: function(obj) {
						write('<div style="background-color: #0f73ff">');
						this.log(obj, 1);
						write('</div>');
					}
                }
            };
            
        function write(string) {
            // The debugWindow is a seperate window so we can freely make use of document.write
            if(debugWindow && !debugWindow.closed) {
                debugWindow.document.write(string);
                debugWindow.document.body.scrollIntoView(false);
            }
            else {
                debugWindow = win.open("Debug", "_blank", "top=" + (win.screen.height - debugWindowHeight)/2 + ",left=" + (win.screen.width - debugWindowWidth)/2 + ",width=" + debugWindowWidth + ",height=" + debugWindowHeight + ",scrollbars=yes");
                debugWindow.document.write("<h2>Debug Information <a style='font-size:10pt; color: white;' href='javascript:window.close()'>close</a></h2>");
                // The debugWindow needs focus to style the body
                debugWindow.focus();
                debugWindow.document.body.style.backgroundColor = "#000000";
                debugWindow.document.body.style.color = "#ffffff";
                write(string);
            }            
        }
            
       return function(obj, type) {
            if(!!Config.debug && !!Config.debugMode) {
                modes[Config.debugMode][type || "log"](obj);
            }
        };
    })(),
    
    Functions = (function() {
        var funcs,
        
        Functions = function() {
            funcs = {};
        };
        
        Functions.prototype = {
            add: function(name, func) {
                funcs[name] = func;
            },
            
            exec: function(name) {
                return funcs[name].apply(ROOT, arguments[1]);
            }
        };
        
        return new Functions();
    })(),
    /**
     * The ModuleLoader is responsible for loading/executing the different modules in the right order
     */
    ModuleLoader = (function() {
		var messages, messageHooks, logTypes, sourceManager;
		/**
		 * Some messages to display the current state of the modules
		 */
        messages = {
            request: "module \"{name}\" requested",
            requestBundle: "bundle \"{name}.*\" requested",
            requestDependencies: "dependencies [\"{dependencies}\"] for module \"{name}\" requested",
            foundSimpleDependency: "found simple dependency \"{dependency}\" for module \"{name}\"",
            foundDependencies: "found complex dependencies [\"{dependencies}\"] for module \"{name}\"",
            foundBundle: "found bundlemodules [\"{name}.{bundle}\"] for module \"{name}\"",
            loading: "attempted to load module \"{name}\" but is already loading",
            loaded: "attempted to load module \"{name}\" but is already loaded",
            loadedManual: "attempted to load module \"{name}\" but was already loaded manual",
            startLoad: "started loading module: \"{name}\"",
            endLoad: "finished loading module: \"{name}\"",
            loadManual: "module \"{name}\" was loaded manual",
            bundleNotDefined: "attempted to load bundle: \"{name}.*\" but bundle is not defined in module \"{name}\"",
            bundleLoading: "attempted to load bundle: \"{name}.*\" but is already loading",
            bundleLoaded: "attempted to load bundle: \"{name}.*\" but is already loaded",
            startLoadBundle: "started loading bundle: \"{name}.*\"",
            endLoadBundle: "finished loading bundle \"{name}.*\"",
            timeout: "timeout: aborted loading module \"{name}\" after {seconds} second(s) - module may not be available on path: \"{path}.js\"",
            subscribing: "\"{name}\" subscribed to \"{moduleorbundle}\"",
            publishing: "\"{moduleorbundle}\" published to \"{name}\""
        };
        
        messageHooks = {
			foundSimpleDependency: function(message, content) {
				return message.replace(/\{dependency\}/gi, content);
			},
			
			foundBundle: function(message, content) {
				return message.replace(/\{bundle\}/gi, content.join("\", \"{name}."));
            },
            
            timeout: function(message, content) {
				return message.replace(/\{seconds\}/gi, Config.waitForTimeout).replace(/\{path\}/gi, content);
            },
            
            foundDependencies: function(message, content) {
	            return message.replace(/\{dependencies\}/gi, content.join("\", \""));
	        },
	        
	        subscribing: function(message, content) {
				return message.replace(/\{moduleorbundle\}/gi, content);
			}
        };
        
        messageHooks.requestDependencies = messageHooks.foundDependencies;
        
        messageHooks.publishing = messageHooks.subscribing;
        
        logTypes = {
			timeout: "error",

			loading: "warn"
        };
        
        logTypes.loaded = logTypes.loadedManual = logTypes.bundleNotDefined = logTypes.bundleLoading = logTypes.bundleLoaded = logTypes.loading;
        
        /**
         * A simple sourceManager that handles adding and removing scripts and stylesheets to and from the head
         */
        sourceManager = {
			/**
			 * A reference to the head of the document
			 */
            head: doc.getElementsByTagName("head")[0],
            
            scripts: {},
            
            styleSheets: {},
            /**
             * Method that creates a timestamp to prevent caching
             * Configurable through JAR.configure()
             * This may disable debugging in the console
             */
            getTimeStamp: function() {
                return Config.cache ? "" : ("?_=" + new Date().getTime());
            },
            /**
             * Adds the script to the end of the head
             * 
             * @param String path
             * 
             */
            addScript: function(path) {
                var script = doc.createElement("script");
                    
                script.type = "text/javascript";
                script.src = path + ".js" + this.getTimeStamp();
                this.head.appendChild(script);
                this.scripts[path] = script;
            },
            /**
             * Removes the specified script from the head
             * 
             * @param String path
             * 
             */
            removeScript: function(path) {
                this.head.removeChild(this.scripts[path]);
                delete this.scripts[path];
            },
            /**
             * Creates a styleSheet according to the browser version
             */
            createStyleSheet: (function() {
				return (doc.createStyleSheet ? function(path) {
					return  doc.createStyleSheet(path).owningElement;
				} : function() {
					return doc.createElement("link");
				});
            })(),
            /**
             * Adds the styleSheet to the beginning of the head
             * 
             * @param String path
             * 
             */
            addStyleSheet: function(path) {
                var stylePath = path + ".css" + this.getTimeStamp(), styleSheet = this.createStyleSheet();
                    
                this.head.insertBefore(styleSheet, this.head.firstChild);
                styleSheet.setAttribute("type", "text/css");
                styleSheet.setAttribute("rel", "stylesheet");
                styleSheet.setAttribute("href", stylePath);
                this.styleSheets[path] = styleSheet;
            },
            /**
             * Removes the specified styleSheet from the head
             * 
             * @param String path
             * 
             */
            removeStyleSheet: function(path) {
                this.head.removeChild(this.styleSheets[path]);
                delete this.styleSheets[path];
            }
        };
		/**
		 * A function to extract the modulename of a bundlerequest or the simple dependency of a module
		 * 
		 * @param String moduleName
		 * 
		 */
        function extractModuleName(moduleName) {
            var tmp = moduleName.split(".");
            tmp.pop();
            return tmp.join(".");
        }
        
        /**
         * Checks whether the moduleName is ending with '.*', which marks a bundlerequest
		 * 
		 * @param String moduleName
         */
        function isBundleRequest(moduleName) {
            return (/\.\*$/).test(moduleName);
        }
        
        /**
         * The Module keeps track of the state of the required script
		 * It listens for Modules or the bundle that it is depending on,
		 * executes the content of the script when all required Modules are loaded
		 * and notifies depending Modules of its execution
		 * 
		 * Every script of a Module is only loaded and executed once
		 * It is also possible to load Modules manual (putting the script tag in the head)
		 * If JAR was defined before it will handle dependency-loading itself
		 * In this case there exists the possiblity that a script is loaded twice
		 * 
		 * @param String moduleName
		 * @param String basePath
         */
        function Module(moduleName, basePath) {
            this._basePath = basePath;
            
            this.state = Module.WAITING;
            this.bundleState = Module.NO_BUNDLE;
            
            this._dependencies = {};
            this.dependenciesNeeded = 0;

            this._bundle = {};
            this.bundleModulesNeeded = 0;
            
            this._setup(moduleName);
        }
        // Module states
        Module.WAITING = 1;
        Module.LOADING = 2;
        Module.LOADED = 4;
        Module.LOADED_MANUAL = 8;
        // Bundle states
        Module.NO_BUNDLE = 0;
        Module.BUNDLE_ADDED = 1;
        Module.BUNDLE_REQUIRED = 2;
        Module.BUNDLE_LOADING = 4;
        Module.BUNDLE_LOADED = 8;
        
        Module.prototype = {
            constructor: Module,
            
            _hook: ROOT,
            
            path: "",
			/**
			 * Method to inspect how the Modules interact with each other
			 * When the state of the Module changes and debugging is turned on it will be logged
			 * 
			 * @param String msgType
			 * @param content 
			 */
            showMessage: function(msgType, content) {
                var message = messages[msgType], messageHook = messageHooks[msgType], logType = logTypes[msgType] || "log";
                
				messageHook && (message = messageHook(message, content));

                message = message.replace(/\{name\}/gi, this.name);
                log(message, logType);
            },
            /**
             * Set up the Module:
             * If it is a bundlerequest the modulename has to be extracted
             *    mysimpledependeny.mymodule.* -> mysimpledependency.mymodule
             * 
             * Get the hookname of the Module to hook it in the module-tree later
             *    -> mymodule
             * 
             * Search for a simple dependency and listen for it
             *    -> mysimpledependency
             * 
             * Create the path to the Module that is used for loading
             *    -> mysimpledependency/mymodule
             * 
             * The rest of the path is created before loading with Module.getFullPath()
             */
            _setup: function(moduleName) {
                var parts;
                
                if(isBundleRequest(moduleName)) {
					this.bundleState = Module.BUNDLE_REQUIRED;
                    moduleName = extractModuleName(moduleName);
                }
                this.name = moduleName;
                    
                parts = this.name.split(".");
                
                this._hookName = parts.pop();
                if(parts.length > 0) {
                    var simpleDependencyName = parts.join(".");
                    this.showMessage("foundSimpleDependency", simpleDependencyName);
                    this._simpleDependency = this.addDependency(simpleDependencyName);
                    this.path += this._simpleDependency.path;
                }
                this.path += "/" + this._hookName;
            },
            
            setBasePath: function(basePath) {
                this._basePath = basePath;
            },
            /**
             * Construct the full path except the file-extension of the basePath and path properties
             *    -> js/mysimpledependency/mymodule/mymodule(.js/.css)
             * 
             * If the first letter of the hookname is uppercase, which is the case for Classes, Interfaces, Mixins, etc.
             * It searches for the Module in the directory of the simple dependency
             *    mysimpledependeny.mymodule.MyClass -> js/mysimpledependeny/mymodule/MyClass(.js/.css)
             */
            getFullPath: function() {
                return (this._basePath || Config.basePath) + this.path + (this._hookName === this._hookName.toLowerCase() ? "/" + this._hookName : "");
            },
            
            isWaiting: function() {
				return this.state & Module.WAITING;
            },
            
            isLoading: function() {
				return this.state & Module.LOADING;
            },
            
            isLoaded: function() {
				return this.state & Module.LOADED;
            },
            
            isLoadedManual: function() {
				return this.state & Module.LOADED_MANUAL;
            },
            
            setLoadedManual: function() {
                this.showMessage("loadManual");
                this.state = Module.LOADED_MANUAL;
            },
            
            setBundleRequired: function(bundleRequired) {
				this.bundleState |= (bundleRequired ? Module.BUNDLE_REQUIRED : Module.NO_BUNDLE);
            },
                    
            isBundleDefinedAndRequired: function() {
                return this.isBundleAdded() && this.isBundleRequired();
            },
            
            isBundleAdded: function() {
				return this.bundleState & Module.BUNDLE_ADDED;
            },
            
            isBundleRequired: function() {
				return this.bundleState & Module.BUNDLE_REQUIRED;
            },
            
            isBundleLoading: function() {
				return this.bundleState & Module.BUNDLE_LOADING;
            },
            
            isBundleLoaded: function() {
				return this.bundleState & Module.BUNDLE_LOADED;
            },
            
            listenFor: function(moduleName, module) {
                var $this = this, iBR = isBundleRequest(moduleName), isDependency = (moduleName in this._dependencies);

                if(!module.isLoaded() || (iBR && !module.isBundleLoaded())) {
                    isDependency ? this.dependenciesNeeded++ : this.bundleModulesNeeded++;
                    this.showMessage("subscribing", moduleName);
                    ModuleLoader.listenFor(moduleName, function() {
                        $this.showMessage("publishing", moduleName);
                        isDependency ? $this.dependenciesNeeded-- : $this.bundleModulesNeeded--;
                        $this.readyCheck();
                    });
                }
            },
            
            addDependency: function(dependencyName) {
                var dependency = ModuleLoader.getModule(dependencyName, this._basePath);
                this._dependencies[dependencyName] = dependency;
                this.listenFor(dependencyName, dependency);
                ModuleLoader.$import(dependencyName, this._basePath);
                return dependency;
            },
            
            addDependencies: function(dependencies) {
				var dependency, dependencyName;
                dependencies = this.flattenDependencies(dependencies);
                this.showMessage("foundDependencies", dependencies);
                for(var i = 0, len =  dependencies.length; i < len; i++) {
                    dependencyName = dependencies[i];
                    dependency = this.addDependency(dependencyName);
                }
            },
            
            flattenDependencies: function(dependencies, referenceDependency) {
				var flattenedDependencies = [];
				
				if(SYSTEM.isArray(dependencies)) {
					for(var i = 0, l = dependencies.length; i < l; i++) {
						flattenedDependencies = flattenedDependencies.concat(this.flattenDependencies(dependencies[i], referenceDependency));
					}
				}
				else if(SYSTEM.isObject(dependencies)) {
					for(var tmpReferenceDependency in dependencies) {
						flattenedDependencies = flattenedDependencies.concat(this.flattenDependencies(dependencies[tmpReferenceDependency], tmpReferenceDependency));
					}
					flattenedDependencies = this.flattenDependencies(flattenedDependencies, referenceDependency);
				}
				else if(SYSTEM.isString(dependencies)) {
					if(referenceDependency) {
						if(referenceDependency === ".") {
							referenceDependency = "";
						}
						if(dependencies === ".") {
							dependencies = referenceDependency;
						}
						else {
							dependencies = referenceDependency + "." + dependencies;
						}
					}
					else if(/^\..+/.test(dependencies)) {
						dependencies = this._simpleDependency.name + dependencies;
					}
					flattenedDependencies.push(dependencies);
				}
				return flattenedDependencies;
	        },

            addBundle: function(bundle) {
                this.showMessage("foundBundle", bundle);
                var len = bundle.length;
                if(!!len) {
                    for(var i = 0; i < len; i++) {
                        var moduleName = this.name + "." + bundle[i];
                        var module = ModuleLoader.getModule((isBundleRequest(moduleName) ? extractModuleName(moduleName) : moduleName) , this._basePath);
                        this.listenFor(moduleName, module);
                        this._bundle[moduleName] = module;
                    }
                    this.bundleState |= Module.BUNDLE_ADDED;
                    if(this.isBundleDefinedAndRequired()) {
                        this.importBundle();
                    }
                }
            },
            
            importBundle: function() {
                this.bundleState |= Module.BUNDLE_LOADING;
                for(var moduleName in this._bundle) {
					ModuleLoader.$import(moduleName);
                }
            },
                    
            $import: function() {
                var $this = this, path = this.getFullPath();
                if(!(this.state & Module.LOADING)) {    
	                this.state = Module.LOADING;
	                
	                this._timer = win.setTimeout(function() {
	                    $this.abort(path);
	                }, Config.waitForTimeout * 1000);

	                sourceManager.addScript(path);
                }
            },
                    
            loadStyleSheet: function() {
                sourceManager.addStyleSheet(this.getFullPath());
            },
            
            abort: function(path, silent) {
                if(!silent) {
                    this.showMessage("timeout", path);
                }
                sourceManager.removeScript(path);
                //sourceManager.removeStyleSheet(path);
                win.clearTimeout(this._timer);
            },
            
            notify: function(props, fn) {
                win.clearTimeout(this._timer);
                if(!!props.deps) {
                    this.addDependencies(props.deps);
                }
                if(!!props.bundle) {
                    this.addBundle(props.bundle);
                }
                if(!!props.styles) {
                    this.loadStyleSheet();
                }
                
                this.onReady = fn;
                
                if(!!props.domReady) {
                    var $this = this;
                    this.dependenciesNeeded++;
                    DOMWatcher.onDomReady(function() {
                        $this.dependenciesNeeded--;
                        $this.readyCheck();
                    });
                }
                else {
                    this.readyCheck();
                }
            },
            
            readyCheck: function() {
                if(!this.isLoaded() && this.dependenciesNeeded === 0 && this.onReady) {
                    this.hook(this.onReady);
					this.state = Module.LOADED;
                    this.showMessage("endLoad");
                    ModuleLoader.notify(this.name);
                }
                if(this.isLoaded() && !this.isBundleLoaded() && (this.isBundleAdded() || this.isBundleRequired()) && this.bundleModulesNeeded === 0) {
                    this.bundleState |= Module.BUNDLE_LOADED;
                    if(this.isBundleDefinedAndRequired()) {
						this.showMessage("endLoadBundle");
					}
					else if(this.isBundleRequired()) {
						this.showMessage("bundleNotDefined");
					}
                    ModuleLoader.notify(this.name + ".*");
                }
            },
                    
            hook: function(fn) {
                    var hook,
                        depHooks = [],
                        hookIndex;
						
                    if(!!this._simpleDependency) {
                        hook = this._simpleDependency.getHook();
                    }
                    else {
                        hook = ROOT;
                    }
					hookIndex = this._hookName;
                    for(var dependencyName in this._dependencies) {
						var dependency = this._dependencies[dependencyName];
						if(dependency !== this._simpleDependency) {
							depHooks.push(dependency.getHook());
                        }
                    }
                    hook[hookIndex] = fn.apply(hook, depHooks);
                    this._hook = hook[hookIndex];
            },

            getHook: function() {
                return this._hook;
            },

            getHookName: function() {
                return this._hookName;
            }
        };
        
        var loaderReady,
            modulesToWaitFor,
			bundlesToWaitFor,
            modules,
            moduleListeners;
        
        function Loader() {
            loaderReady = [];
            modulesToWaitFor = 0;
            bundlesToWaitFor = 0;
            modules = {};
            moduleListeners = {};
        }
        
        Loader.prototype = {
            constructor: Loader,
            
            getModule: function(moduleName, basePath) {
                var iBR = isBundleRequest(moduleName);
                if(iBR) {
                    moduleName = extractModuleName(moduleName);
                }
                if(!(moduleName in modules)) {
                    modules[moduleName] = new Module(moduleName + (iBR ? ".*" : ""), basePath);
                }
                else {
                    if(basePath) {
                        modules[moduleName].setBasePath(basePath);
                    }
                }
                return modules[moduleName];
            },
            
            register: function(props, fn) {
                var module = this.getModule(props.MID);
                if(module.isWaiting()) {
                    module.setLoadedManual();
                }
                if(!(module.isLoaded())) {
                    module.notify(props, fn);
                }
            },
            
            $import: function(moduleName, basePath) {
				var $this = this ,module = this.getModule(moduleName, basePath),
					iBR = isBundleRequest(moduleName);
				
                module.setBundleRequired(iBR);
                
                module.showMessage("request");
                if(module.isWaiting()) {
					module.showMessage("startLoad");
                    modulesToWaitFor++;
                    this.listenFor(moduleName, function() {
						modulesToWaitFor--;
						$this.ready();
                    });
					module.$import();
                }
                else if(module.isLoaded()) {
                    module.showMessage("loaded");
                }
                else if(module.isLoadedManual()) {
                    module.showMessage("loadedManual");
                }
                else if(module.isLoading()) {
                    module.showMessage("loading");
                }
                if(iBR) {
					module.showMessage("requestBundle");
	                if(module.isBundleLoaded()) {
	                    module.showMessage("bundleLoaded");
	                }
	                else if(module.isBundleLoading()) {
	                    module.showMessage("bundleLoading");
	                }
	                else {
						module.showMessage("startLoadBundle");
						bundlesToWaitFor++;
	                    this.listenFor(moduleName, function() {
							bundlesToWaitFor--;
							$this.ready();
	                    });
						module.importBundle();
	                }
                }
            },
            
            ready: function(fn) {
                if(fn) {
                    loaderReady.push(fn);
                }
                if(modulesToWaitFor === 0 && bundlesToWaitFor === 0) {
                    if(loaderReady.length > 0) {
                        loaderReady.shift()();
						this.ready();
                    }
                }
            },
            
            listenFor: function(moduleName, callback) {
				var listeners = moduleListeners[moduleName] = moduleListeners[moduleName] || [];

				listeners.push(callback);
            },
            
            notify: function(moduleName) {
				var listeners = moduleListeners[moduleName];

				while(listeners && listeners.length > 0) {
					listeners.shift()();
				}
            }
        };
        
        return new Loader();
    })(),

    DOMWatcher = (function() {
        var DOMWatcher = function() {
            var CP = "complete",
                RS = "readyState",
                ATE = "attachEvent",
                AEL = "addEventListener",
                DCL = "DOMContentLoaded",
                ORSC = "onreadystatechange",
                w3c = AEL in doc,
                top = false,
                $this = this;

            function DOMContentLoadedHandler() {
                if ( w3c ) {
                    doc.removeEventListener( DCL, DOMContentLoadedHandler, false );
                    $this._setDomReady();
                } else if ( doc[RS] === CP ) {
                    doc.detachEvent( ORSC, DOMContentLoadedHandler );
                    $this._setDomReady();
                }
            }
            
            if ( doc[RS] === CP ) {
                this._defer(function() { $this._setDomReady();} );
            } else if ( w3c ) {
                doc[AEL]( DCL, DOMContentLoadedHandler, false );
                
                win[AEL]( "load", function() {$this._setDomReady();}, false );
                
            } else {
                doc[ATE]( ORSC, DOMContentLoadedHandler );
                
                win[ATE]( "onload", function() {$this._setDomReady();} );

                try {
                    top = win.frameElement === null && docElem;
                } catch(e) {}

                if ( top && top.doScroll ) {
                    (function() {
                        var doScrollCheck = function() {
                            if ( !$this._isReady ) {
                                try {
                                    top.doScroll("left");
                                } catch(e) {
                                    return $this._defer( doScrollCheck, 50 );
                                }
                                
                                $this._setDomReady();
                            }
                        };
                    })();
                }
            }
        };
        
        DOMWatcher.prototype = {
            constructor: DOMWatcher,
            
            _isReady: false,
            
            _domFired: false,
            
            _setDomReady: function() {
				var $this = this;
                if(!this._isReady) {
                    if ( !doc.body ) {
                        return this._defer(function() { $this._setDomReady();} );
                    }

                    this._isReady = true;

                    if(!this._domFired) {
                        this._domFired = true;
                        ModuleLoader.notify("domReady");
                    }
                }
                return true;
            },
            
            onDomReady: function(readyFn) {
                if(this._isReady) {
                    this._defer(readyFn);
                }
                else {
                    ModuleLoader.listenFor("domReady", readyFn);
                }
            },
            
            _defer: function( fn, wait ) {
                win.setTimeout( fn, +wait >= 0 ? wait : 1 );
            }
        };
        
        return new DOMWatcher();
    })();
    
    JAR.register({
		MID: "SYSTEM"
    }, function() {
	    SYSTEM.debug = log;
	    return SYSTEM;
    });
	
    JAR.register({
        MID: "jar",
        bundle: ["lang.*", "html.*", "util.*"]
    }, function() {
        var jar = {
            func: JAR.func,

            exec: function(name) {
                return Functions.exec(name, slice.call(arguments, 1));
            },

            use: function(modules, fn) {
                var args = [];
                for(var i = 0; i < modules.length; i++) {
                    var module = ModuleLoader.getModule(modules[i]).getHook();
                    args.push(module);
                }
                fn.apply(null, args);
            },

            lazyImport: function(modules, fn, basePath) {
                var $this = this;
                for( var i = 0, l = modules.length; i < l; i++) {
                    ModuleLoader.$import(modules[i], basePath);
                }
                ModuleLoader.ready(function() {
                    $this.use(modules, fn);
                });
            },
			
			getConfig: function(option) {
				return Config[option];
			}
        };

        return jar;
    });

    win.JAR = JAR;

})(window);