(function globalSetup(envGlobal) {
    'use strict';

    var InternalsManager, delegateToInternal, registerInternal, getInternal;

    InternalsManager = (function internalsManagerSetup() {
        var internalsToLoad = [
                'AutoAborter',
                'Bundle',
                'BundleResolutionStrategy',
                'BundleResolver',
                'Config',
                'ConfigOptions',
                'ConfigTransforms',
                'Dependencies',
                'DependenciesResolutionStrategy',
                'DependenciesResolver',
                'ExternalBootstrapper',
                'GlobalConfig',
                'GlobalConfigHooks',
                'Interception',
                'InterceptionResolver',
                'InterceptorRegistry',
                'InternalBootstrapper',
                'ModulesQueue',
                'ModulesRegistry',
                'Loader',
                'Logger',
                'Module',
                'NestedResolutionStrategy',
                'PartialModuleInterceptor',
                'PathListManager',
                'PluginInterceptor',
                'Recoverer',
                'ResolutionHelpers',
                'State',
                'System',
                'TypeResolutionStrategies',
                'Utils',
                'VersionResolver'
            ],
            internalsLoading = internalsToLoad.length + 1,
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
            getInternal('InternalBootstrapper').bootstrap();

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
            var SourceManager = getInternal('SourceManager'),
                index;

            for(index = 0; index < internalsLoading; index++) {
                SourceManager.loadInternal(internalsToLoad[index]);
            }
        }

        return InternalsManager;
    })();

    delegateToInternal = InternalsManager.createDelegate;
    registerInternal = InternalsManager.register;
    getInternal = InternalsManager.get;

    registerInternal('SourceManager', function sourceManagerSetup() {
        var doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
            scripts = {},
            jarsScript = getSelfScript(),
            basePath = getBasePath(),
            SourceManager;

        /**
         * @namespace
         *
         * @memberof JARS.internals
         */
        SourceManager =  {
            MAIN_FILE: jarsScript.getAttribute('data-main'),

            BASE_PATH: basePath,

            INTERNALS_PATH: basePath + (jarsScript.getAttribute('data-internals') || '') + 'internals/',
            /**
             * @param {string} internalName
             */
            loadInternal: function(internalName) {
                SourceManager.loadSource('internal:' + internalName, SourceManager.INTERNALS_PATH + internalName + '.js');
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

        function getSelfScript() {
            var scripts = doc.getElementsByTagName('script');

            return scripts[scripts.length - 1];
        }

        function getBasePath() {
            var src = jarsScript.src;

            return src.substring(0, src.lastIndexOf('/') + 1);
        }

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

            module: delegateToInternal('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
                var dynamicInternalName = 'Loader:' + moduleName,
                    ModuleWrapper;

                registerInternal(dynamicInternalName, function internalModuleSetup() {
                    return getInternal('ModulesRegistry').get(moduleName);
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
             * @param {JARS.internals.Bundle.Declaration} bundle
             */
            moduleAuto: function(moduleName, bundle) {
                JARS.module(moduleName, bundle).$export();
            },

            internal: registerInternal,

            configure: delegateToInternal('GlobalConfig', 'update', getJARS),

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
         * @memberof JARS
         * @inner
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
            main = SourceManager.MAIN_FILE,
            config = envGlobal.jarsConfig || main && {};

        if(config) {
            if(main && !config.main) {
                config.main = main;
            }

            JARS.configure(config);
        }
    })();
})(this);
