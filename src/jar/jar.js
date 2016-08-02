(function globalSetup(envGlobal, undef) {
    'use strict';

    var InternalsManager = (function internalsManagerSetup() {
        var INTERNALS_PATH = '../src/jar/internals/',
            internalsToLoad = [
                'CircularDepsChecker',
                'Config',
                'Interception',
                'InterceptionManager',
                'Loader',
                'Module',
                'ModuleState',
                'PartialModuleInterceptor',
                'PathListManager',
                'PluginInterceptor',
                'Resolver',
                'System'
            ],
            internalsLoading = internalsToLoad.length + 2,
            internalsInitialized = false,
            internalsReady = false,
            internals = {},
            readyCallbacks = [],
            InternalsManager;

        InternalsManager = {
            ready: function(readyCallback) {
                if(!internalsReady) {
                    if(!internalsInitialized) {
                        internalsInitialized = true;
                        loadInternals();
                    }

                    readyCallbacks.push(readyCallback);
                }
                else {
                    readyCallback();
                }
            },

            register: function(internalName, factory) {
                var internal = internals[internalName] || (internals[internalName] = {});

                internal.factory = factory;

                if(!internal.loaded) {
                    internal.loaded = true;
                    internalsLoading--;

                    internalsLoading || setupInternals();
                }
            },

            get: function(internalName) {
                var internal = internals[internalName],
                    object;

                if(internal){
                    object = internal.object || (internal.object = internal.factory(InternalsManager));
                }

                return object;
            }
        };

        function setupInternals() {
            var InterceptionManager = InternalsManager.get('InterceptionManager'),
                Loader = InternalsManager.get('Loader'),
                systemModule;

            InterceptionManager.addInterceptor(InternalsManager.get('PluginInterceptor'));

            InterceptionManager.addInterceptor(InternalsManager.get('PartialModuleInterceptor'));

            Loader.registerModule(InternalsManager.get('Resolver').getRootName()).$export();

            systemModule = Loader.registerModule('System', ['Logger', 'Modules']);

            systemModule.$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough
                return InternalsManager.get('System');
            });

            systemModule.updateConfig({
                basePath: INTERNALS_PATH,

                timeout: 10,

                cache: true
            }, true);

            systemModule.request(true);

            while(readyCallbacks.length) {
                readyCallbacks.shift()();
            }

            internalsReady = true;
        }

        function loadInternals() {
            InternalsManager.get('utils').arrayEach(internalsToLoad, loadInternal);
        }

        function loadInternal(internalName) {
            InternalsManager.get('SourceManager').loadSource('internal:' + internalName, INTERNALS_PATH + internalName + '.js');
        }

        return InternalsManager;
    })();

    InternalsManager.register('utils', function() {
        var hasOwnProp, concatString;

        hasOwnProp = (function hasOwnPropSetup() {
            var hasOwn = ({}).hasOwnProperty;

            /**
             * @access private
             *
             * @function
             * @memberof JAR
             * @inner
             *
             * @param {Object} object
             * @param {String} prop
             *
             * @return {Boolean}
             */
            return function hasOwnProp(object, prop) {
                return hasOwn.call(object, prop);
            };
        })();

        concatString = (function concatStringSetup() {
            var join = [].join,
                SPACE = ' ';

            /**
             * @access private
             *
             * @function
             * @memberof JAR
             * @inner
             *
             * @param {...String} string
             *
             * @return {String}
             */
            return function concatString() {
                return join.call(arguments, SPACE);
            };
        })();

        /**
         * @access private
         *
         * @memberof JAR
         * @inner
         *
         * @param {Object} object
         * @param {Function()} callback
         */
        function objectEach(object, callback) {
            var property;

            for (property in object) {
                if (hasOwnProp(object, property)) {
                    if (callback(object[property], property)) {
                        break;
                    }
                }
            }
        }

        /**
         * @access private
         *
         * @memberof JAR
         * @inner
         *
         * @param {Object} dest
         * @param {Object} source
         *
         * @return {Object}
         */
        function objectMerge(dest, source) {
            objectEach(source, function mergeValue(value, key) {
                dest[key] = value;
            });

            return dest;
        }

        /**
         * @access private
         *
         * @memberof JAR
         * @inner
         *
         * @param {(Array|NodeList)} array
         * @param {Function()} callback
         */
        function arrayEach(array, callback) {
            var index = 0,
                length = array.length;

            for (; index < length; index++) {
                if (callback(array[index], index)) {
                    break;
                }
            }
        }

        return {
            hasOwnProp: hasOwnProp,

            concatString: concatString,

            objectEach: objectEach,

            objectMerge: objectMerge,

            arrayEach: arrayEach,

            global: envGlobal
        };
    });

    InternalsManager.register('SourceManager', function sourceManagerSetup(InternalsManager) {
        var arrayEach = InternalsManager.get('utils').arrayEach,
            doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
            scripts = {}, SourceManager;


        /**
         * @access private
         *
         * @namespace SourceManager
         *
         * @memberof JAR
         * @inner
         */
        SourceManager =  {
            /**
             * @access public
             *
             * @memberof JAR~SourceManager
             *
             * @return {String}
             */
            getMain: function() {
                var main;

                arrayEach(doc.getElementsByTagName('script'), function findMainScript(script) {
                    main = script.getAttribute('data-main');

                    return !!main;
                });

                return main;
            },
            /**
             * @access public
             *
             * @memberof JAR~SourceManager
             *
             * @param {String} moduleName
             * @param {String} path
             */
            loadSource: function(moduleName, path) {
                var script = doc.createElement('script');

                head.appendChild(script);

                script.id = moduleName;
                script.type = 'text/javascript';
                script.src = path;
                script.async = true;

                scripts[moduleName] = script;
            },
            /**
             * @access public
             *
             * @memberof JAR~SourceManager
             *
             * @param {String} moduleName
             *
             * @return {Boolean}
             */
            findSource: function(moduleName) {
                return doc.currentScript ? doc.currentScript.id === moduleName : !!doc.getElementById(moduleName);
            },
            /**
             * @access public
             *
             * @memberof JAR~SourceManager
             *
             * @param {String} moduleName
             *
             * @return {String} path
             */
            removeSource: function(moduleName) {
                var script = scripts[moduleName],
                    path = script.src;

                head.removeChild(script);

                delete scripts[moduleName];

                return path;
            }
        };

        return SourceManager;
    });


    envGlobal.JAR = (function jarSetup() {
        var previousJAR = envGlobal.JAR,
            moduleNamesQueue = [],
            configurators = {},
            configs = {
                environment: undef,

                environments: {},

                globalAccess: false,

                supressErrors: false
            },
            defaultModuleConfig = {
                cache: true,

                minified: false,

                timeout: 5
            },
            JAR;

        /**
         * @namespace JAR
         */
        JAR = {
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {Function()} main
             * @param {JAR~Module~failCallback} onAbort
             */
            main: function(main, onAbort) {
                var moduleNames = moduleNamesQueue;

                moduleNamesQueue = [];

                InternalsManager.ready(function() {
                    var Loader = InternalsManager.get('Loader'),
                        root = Loader.getRoot();

                    Loader.$import('System.*', function(System) {
                        var Logger = System.Logger;

                        if (System.isFunction(main)) {
                            if (moduleNames.length) {
                                Loader.$import(moduleNames, onImport, System.isFunction(onAbort) ? onAbort : function globalErrback(abortedModuleName) {
                                    Logger.error('Import of "' + abortedModuleName + '" failed!');
                                });
                            }
                            else {
                                onImport();
                            }
                        }
                        else {
                            Logger.error('No main function provided');
                        }

                        function onImport() {
                            if (configs.supressErrors) {
                                try {
                                    Logger.log('Start executing main...');
                                    main.apply(root, arguments);
                                }
                                catch (e) {
                                    Logger.error((e.stack || e.message || '\n\tError in JavaScript-code: ' + e) + '\nexiting...');
                                }
                                finally {
                                    Logger.log('...done executing main');
                                }
                            }
                            else {
                                main.apply(root, arguments);
                            }
                        }
                    });
                });

                return this;
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {(String|Object|Array)} modules
             */
            $import: function(modules) {
                moduleNamesQueue = moduleNamesQueue.concat(modules);

                return this;
            },

            module: function(moduleName, bundle) {
                InternalsManager.ready(function() {
                    InternalsManager.get('Loader').registerModule(moduleName, bundle);
                });

                return {
                    $import: function(dependencies) {
                        InternalsManager.ready(function() {
                            InternalsManager.get('Loader').getModule(moduleName).$import(dependencies);
                        });

                        return this;
                    },

                    $export: function(factory) {
                        InternalsManager.ready(function() {
                            InternalsManager.get('Loader').getModule(moduleName).$export(factory);
                        });
                    }
                };
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {String} moduleName
             * @param {Array} bundle
             */
            moduleAuto: function(moduleName, bundle) {
                JAR.module(moduleName, bundle).$export();
            },

            internal: InternalsManager.register,
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {(Object|String)} config
             * @param {(Function)} configurator
             */
            addConfigurator: function(config, configurator) {
                InternalsManager.ready(function() {
                    var System = InternalsManager.get('System');

                    if (System.isString(config) && !InternalsManager.get('utils').hasOwnProp(configurators, config) && System.isFunction(configurator)) {
                        configurators[config] = configurator;
                    }
                    else if (System.isObject(config)) {
                        InternalsManager.get('utils').objectEach(config, function addConfigurator(value, option) {
                            JAR.addConfigurator(option, value);
                        });
                    }
                });
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {(Object|String)} config
             * @param {*} [value]
             */
            configure: function(config, value) {
                InternalsManager.ready(function() {
                    var System = InternalsManager.get('System'),
                        configurator;

                    if (System.isString(config)) {
                        configurator = configurators[config];

                        configs[config] = System.isFunction(configurator) ? configurator(value, configs[config], System) : value;
                    }
                    else if (System.isObject(config)) {
                        InternalsManager.get('utils').objectEach(config, function configure(value, option) {
                            JAR.configure(option, value);
                        });
                    }
                });

                return this;
            },

            computeSortedPathList: function(callback, forceRecompute) {
                InternalsManager.ready(function() {
                    InternalsManager.get('PathListManager').computeSortedPathList(callback, forceRecompute);
                });
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {String} context
             * @param {String} switchToContext
             *
             * @return {Boolean}
             */
            flush: function(context, switchToContext) {
                InternalsManager.ready(function() {
                    InternalsManager.get('Loader').flush(context, switchToContext);

                    exposeModulesGlobal(configs.globalAccess);

                });
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @return {Object}
             */
            noConflict: function() {
                envGlobal.JAR = previousJAR;

                return JAR;
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @type {String}
             */
            version: '0.3.0'
        };

        /**
         * @access private
         *
         * @memberof JAR
         * @inner
         *
         * @param {Boolean} expose
         */
        function exposeModulesGlobal(expose) {
            InternalsManager.ready(function() {
                if (expose) {
                    JAR.mods = InternalsManager.get('Loader').getRoot();
                }
            });
        }

        /**
         * @access private
         *
         * @memberof JAR
         * @inner
         */
        function bootstrapJAR() {
            var basePath = './',
                bootstrapConfig = envGlobal.jarconfig || {},
                bootstrapModules = bootstrapConfig.modules,
                main = InternalsManager.get('SourceManager').getMain();

            if (main) {
                basePath = main.substring(0, main.lastIndexOf('/')) || basePath;

                if (!bootstrapConfig.main) {
                    bootstrapConfig.main = main;
                }

                defaultModuleConfig.basePath = basePath;
            }

            InternalsManager.ready(function() {
                if (!InternalsManager.get('System').isArray(bootstrapModules)) {
                    bootstrapModules = bootstrapConfig.modules = bootstrapModules ? [bootstrapModules] : [];
                }

                bootstrapModules.unshift(defaultModuleConfig);

                JAR.configure(bootstrapConfig);
            });
        }

        JAR.addConfigurator({
            debugging: function(debugConfig, oldDebugConfig, System) {
                if (!System.isObject(debugConfig)) {
                    debugConfig = {
                        debug: debugConfig
                    };
                }

                JAR.configure('modules', {
                    restrict: 'System.Logger',

                    config: debugConfig
                });
            },
            /**
             * @param {Boolean} makeGlobal
             * @param {Boolean} isGlobal
             *
             * @return {Boolean}
             */
            globalAccess: function(makeGlobal, isGlobal) {
                if (makeGlobal) {
                    exposeModulesGlobal(!isGlobal);
                }
                else {
                    delete JAR.mods;
                }

                return !!makeGlobal;
            },
            /**
             * @param {String} mainScript
             * @param {String} oldMainScript
             *
             * @return {String}
             */
            main: function(mainScript, oldMainScript) {
                return oldMainScript || (mainScript && InternalsManager.get('SourceManager').loadSource('main', mainScript + '.js'));
            },
            /**
             * @param {Object} newEnvironments
             * @param {Object} oldEnvironments
             *
             * @return {Object<string, function>}
             */
            environments: function(newEnvironments, oldEnvironments) {
                return InternalsManager.get('utils').objectMerge(oldEnvironments, newEnvironments);
            },
            /**
             * @param {String} newEnvironment
             * @param {String} oldEnvironment
             * @param {Object} System
             *
             * @return {String}
             */
            environment: function(newEnvironment, oldEnvironment, System) {
                var environment = configs.environments[newEnvironment];

                if (newEnvironment !== oldEnvironment && System.isObject(environment)) {
                    JAR.configure(environment);
                }

                return newEnvironment;
            },
            /**
             * @param {(Object|Array)} newModuleConfigs
             *
             * @return {Object}
             */
            modules: function(newModuleConfigs) {
                return InternalsManager.get('Loader').setModuleConfig(newModuleConfigs);
            },
            /**
             * @param {String} newLoaderContext
             * @param {String} oldLoaderContext
             *
             * @return {Object}
             */
            loaderContext: function(newLoaderContext, oldLoaderContext) {
                if (newLoaderContext !== oldLoaderContext) {
                    newLoaderContext = InternalsManager.get('Loader').setLoaderContext(newLoaderContext);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newLoaderContext;
            },
            /**
             * @param {Object} newInterceptors
             * @param {Object} oldInterceptors
             * @param {Object} System
             *
             * @return {Object}
             */
            interceptors: function(newInterceptors, oldInterceptors, System) {
                var InterceptionManager = InternalsManager.get('InterceptionManager');

                if (System.isObject(newInterceptors)) {
                    InternalsManager.get('utils').objectEach(newInterceptors, InterceptionManager.addInterceptor);
                }

                return InterceptionManager.getInterceptors();
            }
        });

        bootstrapJAR();

        return JAR;
    })();

})(this);
