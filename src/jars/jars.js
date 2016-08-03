(function globalSetup(envGlobal) {
    'use strict';

    var InternalsManager = (function internalsManagerSetup() {
        var INTERNALS_PATH = 'jars/internals/',
            internalsToLoad = [
                'CircularDepsChecker',
                'ConfigsManager',
                'Interception',
                'InterceptionManager',
                'Loader',
                'Module',
                'ModuleConfig',
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
            var SourceManager = InternalsManager.get('SourceManager'),
                Loader = InternalsManager.get('Loader'),
                System = InternalsManager.get('System'),
                InterceptionManager = InternalsManager.get('InterceptionManager'),
                basePath = SourceManager.getBasePath(),
                systemModule;

            InterceptionManager.addInterceptor(InternalsManager.get('PluginInterceptor'));

            InterceptionManager.addInterceptor(InternalsManager.get('PartialModuleInterceptor'));

            Loader.registerModule(InternalsManager.get('Resolver').getRootName()).$export();

            systemModule = Loader.registerModule('System', ['Logger', 'Modules']);

            systemModule.$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough
                return System;
            });

            InternalsManager.get('ConfigsManager').update({
                modules: [{
                    basePath: basePath,

                    cache: true,

                    minified: false,

                    timeout: 5
                }, {
                    restrict: 'System.*',

                    basePath: basePath + INTERNALS_PATH
                }]
            });

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
            var SourceManager = InternalsManager.get('SourceManager');

            SourceManager.loadSource('internal:' + internalName, SourceManager.getBasePath() + INTERNALS_PATH + internalName + '.js');
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
             * @memberof JARS~utils
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
             * @memberof JARS~utils
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
         * @memberof JARS~utils
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
         * @memberof JARS~utils
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
         * @memberof JARS~utils
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
        var SELF_PATH = 'jars/jars.js',
            arrayEach = InternalsManager.get('utils').arrayEach,
            doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
            scripts = {},
            basePath, SourceManager;


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
             * @memberof JARS~SourceManager
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
             * @memberof JARS~SourceManager
             *
             * @return {String}
             */
            getBasePath: function() {
                var src;

                if(!basePath) {
                    arrayEach(doc.getElementsByTagName('script'), function findSelf(script) {
                        src = script.src;

                        return src.indexOf(SELF_PATH) > -1;
                    });

                    basePath = src.substring(0, src.lastIndexOf(SELF_PATH));
                }

                return basePath;
            },
            /**
             * @access public
             *
             * @memberof JARS~SourceManager
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
             * @memberof JARS~SourceManager
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
             * @memberof JARS~SourceManager
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

    envGlobal.JARS = (function jarSetup() {
        var previousJARS = envGlobal.JARS,
            moduleNamesQueue = [],
            JARS;

        /**
         * @namespace JARS
         */
        JARS = {
            /**
             * @access public
             *
             * @memberof JARS
             *
             * @param {Function()} main
             * @param {JARS~Module~failCallback} onAbort
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
                            if (InternalsManager.get('ConfigsManager').get('supressErrors')) {
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
             * @memberof JARS
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
             * @memberof JARS
             *
             * @param {String} moduleName
             * @param {Array} bundle
             */
            moduleAuto: function(moduleName, bundle) {
                JARS.module(moduleName, bundle).$export();
            },

            internal: InternalsManager.register,
            /**
             * @access public
             *
             * @memberof JARS
             *
             * @param {(Object|String)} config
             * @param {*} [value]
             */
            configure: function(config, value) {
                InternalsManager.ready(function() {
                    InternalsManager.get('ConfigsManager').update(config, value);
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
             * @memberof JARS
             *
             * @param {String} context
             * @param {String} switchToContext
             *
             * @return {Boolean}
             */
            flush: function(context, switchToContext) {
                InternalsManager.ready(function() {
                    InternalsManager.get('Loader').flush(context);

                    JAR.configure('loaderContext', switchToContext);
                });
            },
            /**
             * @access public
             *
             * @memberof JARS
             *
             * @return {Object}
             */
            noConflict: function() {
                envGlobal.JARS = previousJARS;

                return JARS;
            },
            /**
             * @access public
             *
             * @memberof JARS
             *
             * @type {String}
             */
            version: '0.3.0'
        };

        /**
         * @access private
         *
         * @memberof JARS
         * @inner
         */
        function bootstrapJARS() {
            var SourceManager = InternalsManager.get('SourceManager'),
                main = SourceManager.getMain(),
                bootstrapConfig = envGlobal.jarsConfig;

            if(main) {
                if(bootstrapConfig && !bootstrapConfig.main) {
                    bootstrapConfig.main = main;
                }
                else {
                    bootstrapConfig = {
                        main: main
                    };
                }
            }

            if(bootstrapConfig) {
                InternalsManager.ready(function() {
                    InternalsManager.get('ConfigsManager').update(bootstrapConfig);
                });
            }
        }

        bootstrapJARS();

        return JARS;
    })();

})(this);
