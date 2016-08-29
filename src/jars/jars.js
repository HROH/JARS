(function globalSetup(envGlobal) {
    'use strict';

    var InternalsManager, registerInternal, internalsReady, getInternal;

    InternalsManager = (function internalsManagerSetup() {
        var INTERNALS_PATH = 'jars/internals/',
            internalsToLoad = [
                'Bootstrapper',
                'ConfigsManager',
                'Interception',
                'InterceptionManager',
                'Loader',
                'Module',
                'ModuleBundle',
                'ModuleConfig',
                'ModuleDependencies',
                'ModuleLogger',
                'ModuleQueue',
                'ModuleState',
                'PartialModuleInterceptor',
                'PathListManager',
                'PluginInterceptor',
                'ResolutionStrategies',
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

            get: getInternal
        };

        function setupInternals() {
            getInternal('Bootstrapper').bootstrapInternals(INTERNALS_PATH);

            while(readyCallbacks.length) {
                readyCallbacks.shift()();
            }

            internalsReady = true;
        }

        function getInternal(internalName) {
            var internal = internals[internalName],
                object;

            if(internal){
                object = internal.object || (internal.object = internal.factory(InternalsManager));
            }

            return object;
        }

        function loadInternals() {
            getInternal('utils').arrayEach(internalsToLoad, loadInternal);
        }

        function loadInternal(internalName) {
            var SourceManager = getInternal('SourceManager');

            SourceManager.loadSource('internal:' + internalName, SourceManager.getBasePath() + INTERNALS_PATH + internalName + '.js');
        }

        return InternalsManager;
    })();

    registerInternal = InternalsManager.register;
    internalsReady = InternalsManager.ready;
    getInternal = InternalsManager.get;

    registerInternal('utils', function utilsSetup() {
        var hasOwnProp;

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

            objectEach: objectEach,

            objectMerge: objectMerge,

            arrayEach: arrayEach,

            global: envGlobal
        };
    });

    registerInternal('SourceManager', function sourceManagerSetup(InternalsManager) {
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
                    path;

                if(script) {
                        path = script.src;

                    head.removeChild(script);

                    delete scripts[moduleName];
                }

                return path;
            }
        };

        return SourceManager;
    });

    envGlobal.JARS = (function jarsSetup() {
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
             * @param {JARS~Module~FailCallback} onAbort
             */
            main: function(main, onAbort) {
                var moduleNames = moduleNamesQueue;

                moduleNamesQueue = [];

                internalsReady(function bootstrapMain() {
                    getInternal('Bootstrapper').bootstrapMain(moduleNames, main, onAbort);
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
                internalsReady(function registerModule() {
                    getInternal('Loader').registerModule(moduleName, bundle);
                });

                return {
                    $import: function(dependencies) {
                        internalsReady(function $importDependencies() {
                            getInternal('Loader').getModule(moduleName).$import(dependencies);
                        });

                        return this;
                    },

                    $export: function(factory) {
                        internalsReady(function $exportFactory() {
                            getInternal('Loader').getModule(moduleName).$export(factory);
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

            internal: registerInternal,
            /**
             * @access public
             *
             * @memberof JARS
             *
             * @param {(Object|String)} config
             * @param {*} [value]
             */
            configure: function(config, value) {
                internalsReady(function configure() {
                    getInternal('ConfigsManager').update(config, value);
                });

                return this;
            },

            computeSortedPathList: function(callback, forceRecompute) {
                internalsReady(function computeSortedPathList() {
                    getInternal('PathListManager').computeSortedPathList(callback, forceRecompute);
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
                internalsReady(function flush() {
                    getInternal('Loader').flush(context);

                    getInternal('ConfigsManager').update('loaderContext', switchToContext);
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

        return JARS;
    })();

    (function bootstrapJARS() {
        var SourceManager = getInternal('SourceManager'),
            main = SourceManager.getMain(),
            config = envGlobal.jarsConfig || main && {};

        if(config) {
            if(main && !config.main) {
                config.main = main;
            }

            internalsReady(function bootstrapConfig() {
                getInternal('ConfigsManager').update(config);
            });
        }
    })();
})(this);
