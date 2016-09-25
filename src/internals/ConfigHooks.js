JARS.internal('ConfigHooks', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        Loader = getInternal('Loader'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        SourceManager = getInternal('SourceManager'),
        Utils = getInternal('Utils'),
        arrayEach = Utils.arrayEach,
        objectMerge = Utils.objectMerge,
        ConfigHooks;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ConfigHooks = {
        /**
         * @param {(Object|boolean)} debugConfig
         */
        debugging: function(debugConfig) {
            if (!System.isObject(debugConfig)) {
                debugConfig = {
                    debug: debugConfig
                };
            }

            getInternal('ConfigsManager').update('modules', {
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
            var ConfigsManager = getInternal('ConfigsManager'),
                environment = ConfigsManager.get('environments')[newEnvironment];

            if (newEnvironment !== oldEnvironment && System.isObject(environment)) {
                ConfigsManager.update(environment);
            }

            return newEnvironment;
        },
        /**
         * @param {(Object|Object[])} newConfigs
         */
        modules: function setConfigs(newConfigs) {
            var rootModule;

            if (System.isArray(newConfigs)) {
                arrayEach(newConfigs, function setConfig(config) {
                    setConfigs(config);
                });
            }
            else {
                rootModule = Loader.getRootModule();

                if(newConfigs.restrict) {
                    arrayEach(DependenciesResolver.resolveDeps(rootModule, newConfigs.restrict), function updateConfig(moduleName) {
                        var module = Loader.getModule(moduleName);

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

                exposeModulesGlobal(getInternal('ConfigsManager').get('globalAccess'));
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
     * @memberof JARS.internals.ConfigHooks
     * @inner
     *
     * @param {boolean} expose
     */
    function exposeModulesGlobal(expose) {
        if (expose) {
            JARS.mods = Loader.getRootModule().ref;
            JARS.internals = InternalsManager;
        }
    }

    return ConfigHooks;
});
