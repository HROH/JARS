(function globalSetup(envGlobal) {
    'use strict';

    /**
     * @namespace internals
     *
     * @memberof JARS
     */

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
                'Type',
                'TypeLookup',
                'TypeStrategies',
                'Utils',
                'VersionResolver'
            ],
            internals = {},
            commands = [],
            internalsLoading = internalsToLoad.length,
            InternalsManager;

        /**
         * @namespace
         *
         * @memberof JARS.internals
         */
        InternalsManager = {
            /**
             * @param {string} internalName
             * @param {string} methodName
             * @param {function()} returnFn
             *
             * @return {function()}
             */
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
            /**
             * @param {string} internalName
             * @param {JARS.internals.InternalsManager~InternalsFactory} factory
             */
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
            /**
             * @param {string} groupName
             * @param {string[]} group
             */
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
            /**
             * @param {string} internalName
             *
             * @return {*}
             */
            get: function (internalName) {
                var internal = internals[internalName],
                    object;

                if(internal){
                    object = internal.object || (internal.object = internal.factory(InternalsManager.get));
                }

                return object;
            },
            /**
             * @param {string} internalName
             */
            load: function(internalName) {
                InternalsManager.get('SourceManager').load('internal:' + internalName, InternalsManager.get('Env').INTERNALS_PATH + internalName + '.js');
            },
            /**
             * @method
             */
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

        /**
         * @callback InternalsFactory
         *
         * @memberof JARS.internals.InternalsManager
         * @inner
         *
         * @param {JARS.internals.InternalsManager.get} getInternal
         *
         * @return {*}
         */

        return InternalsManager;
    })();

    InternalsManager.register('Env', function envConfigSetup() {
        var scripts = envGlobal.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            BASE_PATH = getData('base') || script.src.substring(0, script.src.lastIndexOf('/') + 1),
            Env;

        /**
         * @namespace
         *
         * @memberof JARS.internals
         */
        Env = {
            /**
             * @type {object}
             */
            global: envGlobal,
            /**
             * @type {string}
             */
            MAIN_MODULE: getData('main'),
            /**
             * @type {string}
             */
            BASE_PATH: BASE_PATH,
            /**
             * @type {string}
             */
            INTERNALS_PATH: getData('internals') || (BASE_PATH + 'internals/'),
        };

        /**
         * @memberof JARS.internals.Env
         * @inner
         *
         * @param {string} key
         *
         * @return {string}
         */
        function getData(key) {
            return script.getAttribute('data-' + key);
        }

        return Env;
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
        var delegateToInternal = InternalsManager.delegate,
            previousJARS = envGlobal.JARS,
            JARS;

        /**
         * @namespace
         * @global
         *
         * @borrows JARS.internals.InternalsManager.register as internal
         * @borrows JARS.internals.InternalsManager.registerGroup as internalGroup
         */
        JARS = {
            /**
             * @param {string} mainModule
             */
            main: function(mainModule) {
                mainModule && JARS.configure('main', mainModule);
            },
            /**
             * @method
             *
             * @param {string} moduleName
             *
             * @return {JARS~ModuleWrapper}
             */
            module: delegateToInternal('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
                var dynamicInternalName = 'ModulesRegistry:' + moduleName,
                    ModuleWrapper;

                InternalsManager.register(dynamicInternalName, function internalModuleSetup(getInternal) {
                    return getInternal('ModulesRegistry').get(moduleName);
                });

                /**
                 * @namespace
                 *
                 * @memberof JARS
                 * @inner
                 */
                ModuleWrapper = {
                    /**
                     * @method
                     *
                     * @param {JARS.internals.Dependencies.Declaration}
                     *
                     * @return {JARS~ModuleWrapper}
                     */
                    $import: delegateToInternal(dynamicInternalName, '$import', function returnSelf() {
                        return ModuleWrapper;
                    }),
                    /**
                     * @method
                     *
                     * @param {JARS.internals.Module.ModuleFactory} factory
                     */
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

            internal: InternalsManager.register,

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
             * @const {string}
             * @default
             */
            version: '0.3.0'
        };

        JARS.main(InternalsManager.get('Env').MAIN_MODULE);

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
