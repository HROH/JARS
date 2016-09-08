(function globalSetup(envGlobal) {
    'use strict';

    var InternalsManager, delegateToInternal, registerInternal, getInternal;

    InternalsManager = (function internalsManagerSetup() {
        var INTERNALS_PATH = 'internals/',
            internalsToLoad = [
                'ConfigsManager',
                'ExternalBootstrapper',
                'Interception',
                'InterceptionManager',
                'InternalBootstrapper',
                'Loader',
                'LoaderQueue',
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
            createDelegate: function(internalName, methodName, returnFn) {
                return function internalDelegator() {
                    var args = Array.prototype.slice.call(arguments);

                    function readyCallback() {
                        var internal = getInternal(internalName);

                        internal[methodName].apply(internal, args);
                    }

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

                    return returnFn && returnFn.apply(null, args);
                };
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
            getInternal('InternalBootstrapper').bootstrap(INTERNALS_PATH);

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
            var SourceManager = getInternal('SourceManager');

            getInternal('utils').arrayEach(internalsToLoad, function loadInternal(internalName) {
                SourceManager.loadSource('internal:' + internalName, SourceManager.getBasePath() + INTERNALS_PATH + internalName + '.js');
            });
        }

        return InternalsManager;
    })();

    delegateToInternal = InternalsManager.createDelegate;
    registerInternal = InternalsManager.register;
    getInternal = InternalsManager.get;

    registerInternal('utils', function utilsSetup() {
        var hasOwn = ({}).hasOwnProperty,
            utils;

        /**
         * @access public
         *
         * @namespace utils
         *
         * @memberof JARS
         * @inner
         */
        utils = {
            /**
             * @access public
             *
             * @function
             * @memberof JARS~utils
             *
             * @param {Object} object
             * @param {String} prop
             *
             * @return {Boolean}
             */
            hasOwnProp: function(object, prop) {
                return hasOwn.call(object, prop);
            },
            /**
             * @access public
             *
             * @memberof JARS~utils
             *
             * @param {Object} object
             * @param {Function()} callback
             */
            objectEach: function(object, callback) {
                var property;

                for (property in object) {
                    if (utils.hasOwnProp(object, property)) {
                        if (callback(object[property], property)) {
                            break;
                        }
                    }
                }
            },
            /**
             * @access public
             *
             * @memberof JARS~utils
             *
             * @param {Object} dest
             * @param {Object} source
             *
             * @return {Object}
             */
            objectMerge: function(dest, source) {
                utils.objectEach(source, function mergeValue(value, key) {
                    dest[key] = value;
                });

                return dest;
            },
            /**
             * @access public
             *
             * @memberof JARS~utils
             *
             * @param {(Array|NodeList)} array
             * @param {Function()} callback
             */
            arrayEach: function(array, callback) {
                var index = 0,
                    length = array.length;

                for (; index < length; index++) {
                    if (callback(array[index], index)) {
                        break;
                    }
                }
            },

            global: envGlobal
        };

        return utils;
    });

    registerInternal('SourceManager', function sourceManagerSetup(InternalsManager) {
        var SELF_PATH = 'jars.js',
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
            JARS;

        /**
         * @namespace JARS
         */
        JARS = {
            main: delegateToInternal('ExternalBootstrapper', 'main', getJARS),

            $import: delegateToInternal('ExternalBootstrapper', '$import', getJARS),

            module: delegateToInternal('Loader', 'registerModule', function returnModuleWrapper(moduleName) {
                var dynamicInternalName = 'Loader:' + moduleName,
                    ModuleWrapper;

                registerInternal(dynamicInternalName, function internalModuleSetup() {
                    return getInternal('Loader').getModule(moduleName);
                });

                ModuleWrapper = {
                    $import: delegateToInternal(dynamicInternalName, '$import', function returnSelf() {
                        return ModuleWrapper;
                    }),

                    $export: delegateToInternal(dynamicInternalName, '$export')
                };

                return ModuleWrapper;
            }),
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

            configure: delegateToInternal('ConfigsManager', 'update', getJARS),

            computeSortedPathList: delegateToInternal('PathListManager', 'computeSortedPathList', getJARS),

            flush: delegateToInternal('Loader', 'flush', getJARS),
            /**
             * @access public
             *
             * @memberof JARS
             *
             * @return {JARS}
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

        function getJARS() {
            return JARS;
        }

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

            JARS.configure(config);
        }
    })();
})(this);
