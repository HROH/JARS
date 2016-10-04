JARS.internal('GlobalConfigHooks', function globalConfigHooksSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        InterceptorRegistry = getInternal('InterceptorRegistry'),
        SourceManager = getInternal('SourceManager'),
        Utils = getInternal('Utils'),
        arrayEach = Utils.arrayEach,
        objectMerge = Utils.objectMerge,
        GlobalConfigHooks;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    GlobalConfigHooks = {
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {(Object|boolean)} debugConfig
         */
        debugging: function(globalConfig, debugConfig) {
            if (!System.isObject(debugConfig)) {
                debugConfig = {
                    debug: debugConfig
                };
            }

            globalConfig.update('modules', {
                config: debugConfig
            });
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {boolean} makeGlobal
         *
         * @return {boolean}
         */
        globalAccess: function(globalConfig, makeGlobal) {
            if (makeGlobal) {
                exposeModulesGlobal(!globalConfig.get('globalAccess'));
            }
            else {
                delete JARS.mods;
                delete JARS.internals;
            }

            return !!makeGlobal;
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {string} mainScript
         *
         * @return {string}
         */
        main: function(globalConfig, mainScript) {
            return globalConfig.get('main') || (mainScript && SourceManager.loadSource('main', mainScript + '.js'));
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {Object} environments
         *
         * @return {Object<string, Object>}
         */
        environments: function(globalConfig, environments) {
            return objectMerge(globalConfig.get('environments'), environments);
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {string} environment
         *
         * @return {string}
         */
        environment: function(globalConfig, environment) {
            var environmentConfig = globalConfig.get('environments')[environment];

            if (environmentConfig !== globalConfig.get('environment')) {
                globalConfig.update(environmentConfig);
            }

            return environment;
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {Object} config
         */
        modules: function(globalConfig, config) {
            var rootModule = ModulesRegistry.getRoot();

            if(config.restrict) {
                arrayEach(DependenciesResolver.resolveDeps(rootModule, config.restrict), function updateConfig(moduleName) {
                    var module = ModulesRegistry.get(moduleName);

                    (BundleResolver.isBundle(moduleName) ? module.bundle : module).config.update(config);
                });
            }
            else {
                rootModule.config.update(config);
            }
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {string} loaderContext
         *
         * @return {string}
         */
        loaderContext: function(globalConfig, loaderContext) {
            if (loaderContext !== globalConfig.get('loaderContext')) {
                exposeModulesGlobal(globalConfig.get('globalAccess'));
            }

            return loaderContext;
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {JARS.internals.Interceptor} interceptor
         */
        interceptors: function(globalConfig, interceptor) {
            InterceptorRegistry.register(interceptor);
        }
    };

    /**
     * @memberof JARS.internals.GlobalConfigHooks
     * @inner
     *
     * @param {boolean} expose
     */
    function exposeModulesGlobal(expose) {
        if (expose) {
            JARS.mods = ModulesRegistry.getRoot().ref;
            JARS.internals = InternalsManager;
        }
    }

    return GlobalConfigHooks;
});
