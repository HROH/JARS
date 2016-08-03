JARS.internal('ConfigsManager', function configsManagerSetup(InternalsManager) {
    var utils = InternalsManager.get('utils'),
        objectEach = utils.objectEach,
        objectMerge = utils.objectMerge,
        System = InternalsManager.get('System'),
        Loader = InternalsManager.get('Loader'),
        InterceptionManager = InternalsManager.get('InterceptionManager'),
        SourceManager = InternalsManager.get('SourceManager'),
        configs = {
            environments: {},

            globalAccess: false,

            supressErrors: false
        },
        configHooks = {
            debugging: function(debugConfig) {
                if (!System.isObject(debugConfig)) {
                    debugConfig = {
                        debug: debugConfig
                    };
                }

                ConfigsManager.update('modules', {
                    restrict: 'System.Logger',

                    config: debugConfig
                });
            },
            /**
             * @param {Boolean} makeGlobal
             * @param {Boolean} isGlobal
             *
             * @return {Boolean}
             */
            globalAccess: function(makeGlobal, isGlobal) {
                if (makeGlobal) {
                    exposeModulesGlobal(!isGlobal);
                }
                else {
                    delete JARS.mods;
                }

                return !!makeGlobal;
            },
            /**
             * @param {String} mainScript
             * @param {String} oldMainScript
             *
             * @return {String}
             */
            main: function(mainScript, oldMainScript) {
                return oldMainScript || (mainScript && SourceManager.loadSource('main', mainScript + '.js'));
            },
            /**
             * @param {Object} newEnvironments
             * @param {Object} oldEnvironments
             *
             * @return {Object<string, function>}
             */
            environments: function(newEnvironments, oldEnvironments) {
                return objectMerge(oldEnvironments, newEnvironments);
            },
            /**
             * @param {String} newEnvironment
             * @param {String} oldEnvironment
             *
             * @return {String}
             */
            environment: function(newEnvironment, oldEnvironment) {
                var environment = configs.environments[newEnvironment];

                if (newEnvironment !== oldEnvironment && System.isObject(environment)) {
                    ConfigsManager.update(environment);
                }

                return newEnvironment;
            },
            /**
             * @param {(Object|Array)} newModuleConfigs
             *
             * @return {Object}
             */
            modules: function(newModuleConfigs) {
                return Loader.setModuleConfig(newModuleConfigs);
            },
            /**
             * @param {String} newLoaderContext
             * @param {String} oldLoaderContext
             *
             * @return {Object}
             */
            loaderContext: function(newLoaderContext, oldLoaderContext) {
                if (newLoaderContext !== oldLoaderContext) {
                    newLoaderContext = Loader.setLoaderContext(newLoaderContext);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newLoaderContext;
            },
            /**
             * @param {Object} newInterceptors
             *
             * @return {Object}
             */
            interceptors: function(newInterceptors) {
                if (System.isObject(newInterceptors)) {
                    objectEach(newInterceptors, InterceptionManager.addInterceptor);
                }

                return InterceptionManager.getInterceptors();
            }
        },
        ConfigsManager;

    ConfigsManager = {
        update: function(config, value) {
            var configHook = configHooks[config];

            if (System.isString(config)) {
                configs[config] = System.isFunction(configHook) ? configHook(value, configs[config]) : value;
            }
            else if (System.isObject(config)) {
                objectEach(config, function configure(value, option) {
                    ConfigsManager.update(option, value);
                });
            }
        },

        get: function(config) {
            return configs[config];
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~ConfigsManager
     * @inner
     *
     * @param {Boolean} expose
     */
    function exposeModulesGlobal(expose) {
        if (expose) {
            JARS.mods = Loader.getRoot();
        }
    }

    return ConfigsManager;
});
