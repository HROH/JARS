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
                'ConfigTransforms',
                'Dependencies',
                'DependenciesAborter',
                'DependenciesChecker',
                'DependenciesCollectorGetCircular',
                'DependenciesCollectorHasCircular',
                'DependenciesLogger',
                'DependenciesResolver',
                'GlobalConfig',
                'GlobalConfigHooks',
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
                'ResolutionStrategies',
                'State',
                'StateInfo',
                'System',
                'TypeStrategies',
                'Utils',
                'VersionResolver'
            ],
            internals = {},
            commands = [],
            internalsLoading = internalsToLoad.length,
            InternalsManager;

        InternalsManager = {
            delegate: function(internalName, methodName, returnFn) {
                return function internalDelegator() {
                    var args = Array.prototype.slice.call(arguments),
                        command = [internalName, methodName, args];

                    if(internalsLoading !== 0) {
                        commands.push(command);
                    }
                    else {
                        InternalsManager.get('InternalBootstrapper').run(command);
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
                        InternalsManager.get('InternalBootstrapper').bootstrap(commands);
                    }
                }
            },

            registerGroup: function (groupName, group) {
                var groupLength = group.length,
                    internalNames = [],
                    index, internalName;

                for(index = 0; index < groupLength; index++) {
                    internalName = groupName + '/' + group[index];
                    internalNames.push(internalName);
                    InternalsManager.load(internalName);
                }

                internalsToLoad = internalsToLoad.concat(internalNames);
                internalsLoading += groupLength;

                InternalsManager.register(groupName, function internalGroupSetup(getInternal) {
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

            load: function(internalName) {
                InternalsManager.get('SourceManager').load('internal:' + internalName, InternalsManager.get('EnvConfig').INTERNALS_PATH + internalName + '.js');
            },

            init: function() {
                var index;

                InternalsManager.register('InternalsManager', function() {
                    return InternalsManager;
                });

                for(index = 0; index < internalsLoading; index++) {
                    InternalsManager.load(internalsToLoad[index]);
                }
            }
        };

        return InternalsManager;
    })();

    InternalsManager.register('EnvConfig', function envConfigSetup() {
        var scripts = envGlobal.document.getElementsByTagName('script'),
            jarsScript = scripts[scripts.length - 1],
            src = jarsScript.src,
            basePath = src.substring(0, src.lastIndexOf('/') + 1);

        return {
            MAIN_MODULE: jarsScript.getAttribute('data-main'),

            BASE_PATH: basePath,

            INTERNALS_PATH: jarsScript.getAttribute('data-internals') || (basePath + 'internals/'),
        };
    });

    InternalsManager.register('SourceManager', function sourceManagerSetup() {
        var doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
            SourceManager;

        /**
         * @namespace
         *
         * @memberof JARS.internals
         */
        SourceManager =  {
            /**
             * @param {string} moduleName
             * @param {string} path
             */
            load: function(moduleName, path) {
                var script = doc.createElement('script');

                head.appendChild(script);

                script.id = moduleName;
                script.type = 'text/javascript';
                script.src = path;
                script.async = true;
            }
        };

        return SourceManager;
    });

    InternalsManager.init();

    envGlobal.JARS = (function jarsSetup() {
        var getInternal = InternalsManager.get,
            delegateToInternal = InternalsManager.delegate,
            registerInternal = InternalsManager.register,
            previousJARS = envGlobal.JARS,
            JARS;

        /**
         * @namespace
         * @global
         */
        JARS = {
            main: function(mainModule) {
                mainModule && JARS.configure('main', mainModule);
            },

            module: delegateToInternal('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
                var dynamicInternalName = 'ModulesRegistry:' + moduleName,
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

        JARS.main(getInternal('EnvConfig').MAIN_MODULE);

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
})(this);
