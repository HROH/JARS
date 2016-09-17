JARS.internal('ConfigHooks', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        Loader = getInternal('Loader'),
        Resolver = getInternal('Resolver'),
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
         * @param {(Object|Object[])} newModuleConfigs
         */
        modules: function setModuleConfigs(newModuleConfigs) {
            var modules, rootName;

            if (System.isArray(newModuleConfigs)) {
                arrayEach(newModuleConfigs, function setModuleConfig(config) {
                    setModuleConfigs(config);
                });
            }
            else {
                rootName = Resolver.getRootName();
                modules = newModuleConfigs.restrict ? DependenciesResolver.resolveDeps(Loader.getModule(rootName), newModuleConfigs.restrict) : [rootName];

                arrayEach(modules, function updateModuleConfig(moduleName) {
                    var module = Loader.getModule(moduleName);

                    (BundleResolver.isBundle(moduleName) ? module.bundle : module).config.update(newModuleConfigs);
                });
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
         * @param {JARS.internals.InterceptionManager.Interceptor[]} newInterceptors
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
            JARS.mods = Loader.getRoot();
            JARS.internals = InternalsManager;
        }
    }

    return ConfigHooks;
});
