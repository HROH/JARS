(function globalSetup(envGlobal) {
    'use strict';

    var InternalsManager = (function internalsManagerSetup() {
        var internalsToLoad = [
                'AutoAborter',
                'Bundle',
                'BundleAborter',
                'BundleResolver',
                'Config',
                'ConfigOptions',
                'Dependencies',
                'DependenciesAborter',
                'DependenciesChecker',
                'DependenciesCollectorGetCircular',
                'DependenciesCollectorHasCircular',
                'DependenciesLogger',
                'DependenciesResolver',
                'GlobalConfig',
                'Interception',
                'InterceptionResolver',
                'InterceptorRegistry',
                'InternalBootstrapper',
                'Loader',
                'LogWrap',
                'Module',
                'ModulesQueue',
                'ModulesRegistry',
                'PartialModuleInterceptor',
                'PathManager',
                'PluginInterceptor',
                'Recoverer',
                'ResolutionHelpers',
                'State',
                'StateInfo',
                'System',
                'Utils',
                'VersionResolver',
                'hooks',
                'resolutionStrategies',
                'transforms',
                'typeStrategies'
            ],
            internals = {},
            callbacks = [],
            internalsLoading = internalsToLoad.length,
            InternalsManager;

        InternalsManager = {
            createDelegate: function(internalName, methodName, returnFn) {
                return function internalDelegator() {
                    var args = Array.prototype.slice.call(arguments);

                    function callback() {
                        var internal = InternalsManager.get(internalName);

                        internal[methodName].apply(internal, args);
                    }

                    if(internalsLoading !== 0) {
                        callbacks.push(callback);
                    }
                    else {
                        callback();
                    }

                    return returnFn && returnFn.apply(null, args);
                };
            },

            register: function(internalName, factory) {
                var internal = internals[internalName] || (internals[internalName] = {});

                internal.factory = factory;

                if(!internal.loaded) {
                    internal.loaded = true;

                    if(internalsToLoad.indexOf(internalName) != -1 && --internalsLoading === 0) {
                        InternalsManager.get('InternalBootstrapper').bootstrap();

                        while(callbacks.length) {
                            callbacks.shift()();
                        }
                    }
                }
            },

            registerGroup: function (groupName, group) {
                var SourceManager = InternalsManager.get('SourceManager'),
                    groupLength = group.length,
                    internalNames = [],
                    index, internalName;

                for(index = 0; index < groupLength; index++) {
                    internalName = groupName + '/' + group[index];
                    internalNames.push(internalName);
                    SourceManager.loadInternal(internalName);
                }

                internalsToLoad = internalsToLoad.concat(internalNames);
                internalsLoading += groupLength;

                InternalsManager.register(groupName, function(getInternal) {
                    var result = {},
                        key;

                    for(index = 0; index < groupLength; index++) {
                        key = group[index];
                        result[key.charAt(0).toLowerCase() + key.substr(1)] = getInternal(internalNames[index]);
                    }

                    return result;
                });
            },

            get: function (internalName) {
                var internal = internals[internalName],
                    object;

                if(internal){
                    object = internal.object || (internal.object = internal.factory(InternalsManager.get));
                }

                return object;
            },

            initialize: function() {
                var SourceManager = InternalsManager.get('SourceManager'),
                    index;

                InternalsManager.register('InternalsManager', function() {
                    return InternalsManager;
                });

                for(index = 0; index < internalsLoading; index++) {
                    SourceManager.loadInternal(internalsToLoad[index]);
                }
            }
        };

        return InternalsManager;
    })();

    InternalsManager.register('SourceManager', function sourceManagerSetup() {
        var doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
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
            },

            loadInternal: function(internalName) {
                SourceManager.loadSource('internal:' + internalName, SourceManager.INTERNALS_PATH + internalName + '.js');
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

    InternalsManager.initialize();

    envGlobal.JARS = (function jarsSetup() {
        var delegateToInternal = InternalsManager.createDelegate,
            registerInternal = InternalsManager.register,
            mainCounter = 0,
            delegatedLoaderImport = delegateToInternal('Loader', '$import'),
            previousJARS = envGlobal.JARS,
            JARS;

        /**
         * @namespace
         * @global
         */
        JARS = {
            main: function(mainCallback) {
                JARS.$import().main(mainCallback);
            },

            $import: function(moduleNames) {
                var mainModule = JARS.module('main_$' + mainCounter++).$import(moduleNames);

                mainModule.main = function(mainCallback) {
                    delegatedLoaderImport('System.*', function() {
                        mainModule.$export(mainCallback);
                    });
                };

                return mainModule;
            },

            module: delegateToInternal('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
                var dynamicInternalName = 'ModulesRegistry:' + moduleName,
                    ModuleWrapper;

                registerInternal(dynamicInternalName, function internalModuleSetup() {
                    return InternalsManager.get('ModulesRegistry').get(moduleName);
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

            internalGroup: InternalsManager.registerGroup,

            configure: delegateToInternal('GlobalConfig', 'update', getJARS),

            computeSortedPathList: delegateToInternal('PathManager', 'computeSortedPathList', getJARS),

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
        var SourceManager = InternalsManager.get('SourceManager'),
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
