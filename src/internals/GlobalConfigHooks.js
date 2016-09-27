JARS.internal('GlobalConfigHooks', function globalConfigHooksSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        Loader = getInternal('Loader'),
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
         * @param {(Object|boolean)} debugConfig
         */
        debugging: function(debugConfig) {
            if (!System.isObject(debugConfig)) {
                debugConfig = {
                    debug: debugConfig
                };
            }

            getInternal('GlobalConfig').update('modules', {
                restrict: 'System.Logger',

                config: debugConfig
            });
        },
        /**
         * @param {boolean} makeGlobal
         * @param {boolean} isGlobal
         *
         * @return {boolean}
         */
        globalAccess: function(makeGlobal, isGlobal) {
            if (makeGlobal) {
                exposeModulesGlobal(!isGlobal);
            }
            else {
                delete JARS.mods;
                delete JARS.internals;
            }

            return !!makeGlobal;
        },
        /**
         * @param {string} mainScript
         * @param {string} oldMainScript
         *
         * @return {string}
         */
        main: function(mainScript, oldMainScript) {
            return oldMainScript || (mainScript && SourceManager.loadSource('main', mainScript + '.js'));
        },
        /**
         * @param {Object} newEnvironments
         * @param {Object} oldEnvironments
         *
         * @return {Object<string, Object>}
         */
        environments: function(newEnvironments, oldEnvironments) {
            return objectMerge(oldEnvironments, newEnvironments);
        },
        /**
         * @param {string} newEnvironment
         * @param {string} oldEnvironment
         *
         * @return {string}
         */
        environment: function(newEnvironment, oldEnvironment) {
            var GlobalConfig = getInternal('GlobalConfig'),
                environment = GlobalConfig.get('environments')[newEnvironment];

            if (newEnvironment !== oldEnvironment && System.isObject(environment)) {
                GlobalConfig.update(environment);
            }

            return newEnvironment;
        },
        /**
         * @param {(Object|Object[])} newConfigs
         */
        modules: function updateConfigs(newConfigs) {
            var rootModule;

            if (System.isArray(newConfigs)) {
                arrayEach(newConfigs, updateConfigs);
            }
            else {
                rootModule = ModulesRegistry.getRoot();

                if(newConfigs.restrict) {
                    arrayEach(DependenciesResolver.resolveDeps(rootModule, newConfigs.restrict), function updateConfig(moduleName) {
                        var module = ModulesRegistry.get(moduleName);

                        (BundleResolver.isBundle(moduleName) ? module.bundle : module).config.update(newConfigs);
                    });
                }
                else {
                    rootModule.config.update(newConfigs);
                }
            }
        },
        /**
         * @param {string} newLoaderContext
         * @param {string} oldLoaderContext
         *
         * @return {string}
         */
        loaderContext: function(newLoaderContext, oldLoaderContext) {
            if (newLoaderContext !== oldLoaderContext) {
                newLoaderContext = Loader.setLoaderContext(newLoaderContext);

                exposeModulesGlobal(getInternal('GlobalConfig').get('globalAccess'));
            }

            return newLoaderContext;
        },
        /**
         * @param {JARS.internals.Interceptor[]} newInterceptors
         */
        interceptors: function(newInterceptors) {
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
