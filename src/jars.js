(function globalSetup(envGlobal) {
    'use strict';

    var InternalsManager, delegateToInternal, registerInternal, getInternal;

    InternalsManager = (function internalsManagerSetup() {
        var INTERNALS_PATH = 'internals/',
            internalsToLoad = [
                'ConfigHooks',
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
         * @namespace
         *
         * @memberof JARS.internals
         */
        utils = {
            /**
             * @param {Object} object
             * @param {string} prop
             *
             * @return {boolean}
             */
            hasOwnProp: function(object, prop) {
                return hasOwn.call(object, prop);
            },
            /**
             * @param {Object} object
             * @param {function(*, string): boolean} callback
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
             * @param {(Array|NodeList)} array
             * @param {function(*, number): boolean} callback
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
            /**
             * @type Global
             */
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
         * @namespace
         *
         * @memberof JARS.internals
         */
        SourceManager =  {
            /**
             * @return {string}
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
             * @return {string}
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
             * @param {string} moduleName
             * @param {string} path
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
             * @param {string} moduleName
             *
             * @return {boolean}
             */
            findSource: function(moduleName) {
                return doc.currentScript ? doc.currentScript.id === moduleName : !!doc.getElementById(moduleName);
            },
            /**
             * @param {string} moduleName
             *
             * @return {string} path
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
         * @namespace
         * @global
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
             * @param {string} moduleName
             * @param {JARS.internals.ModuleBundle.Declaration} bundle
             */
            moduleAuto: function(moduleName, bundle) {
                JARS.module(moduleName, bundle).$export();
            },

            internal: registerInternal,

            configure: delegateToInternal('ConfigsManager', 'update', getJARS),

            computeSortedPathList: delegateToInternal('PathListManager', 'computeSortedPathList', getJARS),

            flush: delegateToInternal('Loader', 'flush', getJARS),
            /**
             * @return {JARS}
             */
            noConflict: function() {
                envGlobal.JARS = previousJARS;

                return JARS;
            },
            /**
             * @type {string}
             */
            version: '0.3.0'
        };

        /**
         * @namespace internals
         *
         * @memberof JARS
         */

        /**
         * @private
         *
         * @memberof JARS
         *
         * @return {JARS}
         */
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
