JARS.internal('GlobalConfigHooks', function globalConfigHooksSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        InterceptionManager = getInternal('InterceptionManager'),
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
                restrict: 'System.Logger',

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
            var GlobalConfig = getInternal('GlobalConfig'),
                environmentConfig = GlobalConfig.get('environments')[environment];

            if (environmentConfig !== globalConfig.get('environment') && System.isObject(environmentConfig)) {
                GlobalConfig.update(environmentConfig);
            }

            return environment;
        },
        /**
         * @param {JARS.internals.GlobalConfig} globalConfig
         * @param {(Object|Object[])} configs
         */
        modules: function(globalConfig, configs) {
            var rootModule;

            if (System.isArray(configs)) {
                arrayEach(configs, function updateConfig(config) {
                    globalConfig.update('modules', config);
                });
            }
            else {
                rootModule = ModulesRegistry.getRoot();

                if(configs.restrict) {
                    arrayEach(DependenciesResolver.resolveDeps(rootModule,configs.restrict), function updateConfig(moduleName) {
                        var module = ModulesRegistry.get(moduleName);

                        (BundleResolver.isBundle(moduleName) ? module.bundle : module).config.update(configs);
                    });
                }
                else {
                    rootModule.config.update(configs);
                }
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
         * @param {JARS.internals.Interceptor[]} newInterceptors
         */
        interceptors: function(globalConfig, newInterceptors) {
            if (System.isArray(newInterceptors)) {
                arrayEach(newInterceptors, InterceptionManager.addInterceptor);
            }
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
