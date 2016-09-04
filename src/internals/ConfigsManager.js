JARS.internal('ConfigsManager', function configsManagerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        utils = getInternal('utils'),
        objectEach = utils.objectEach,
        arrayEach = utils.arrayEach,
        objectMerge = utils.objectMerge,
        System = getInternal('System'),
        Resolver = getInternal('Resolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        SourceManager = getInternal('SourceManager'),
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
            modules: function setModuleConfigs(newModuleConfigs) {
                var loader = getLoader(),
                    modules;

                if (System.isArray(newModuleConfigs)) {
                    arrayEach(newModuleConfigs, function setModuleConfig(config) {
                        setModuleConfigs(config);
                    });
                }
                else {
                    modules = newModuleConfigs.restrict ? Resolver.resolve(newModuleConfigs.restrict) : [Resolver.getRootName()];

                    arrayEach(modules, function updateModuleConfig(moduleName) {
                        loader.getModule(moduleName).updateConfig(newModuleConfigs, Resolver.isBundle(moduleName));
                    });
                }

                return loader.getModule(Resolver.getRootName()).bundleConfig;
            },
            /**
             * @param {String} newLoaderContext
             * @param {String} oldLoaderContext
             *
             * @return {Object}
             */
            loaderContext: function(newLoaderContext, oldLoaderContext) {
                if (newLoaderContext !== oldLoaderContext) {
                    newLoaderContext = getLoader().setLoaderContext(newLoaderContext);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newLoaderContext;
            },
            /**
             * @param {JARS~InterceptionManager~Interceptor[]} newInterceptors
             *
             * @return {Object<String, JARS~InterceptionManager~Interceptor>}
             */
            interceptors: function(newInterceptors) {
                if (System.isArray(newInterceptors)) {
                    arrayEach(newInterceptors, InterceptionManager.addInterceptor);
                }

                return InterceptionManager.getInterceptors();
            }
        },
        ConfigsManager;

    /**
    * @access public
    *
    * @namespace ConfigsManager
    *
    * @memberof JARS
    * @inner
    */
    ConfigsManager = {
        /**
        * @access public
        *
        * @memberof JARS~ConfigsManager
        *
        * @param {(Object|String)} config
        * @param {*} value
        */
        update: function(config, value) {
            var configHook = configHooks[config];

            if (System.isString(config)) {
                configs[config] = System.isFunction(configHook) ? configHook(value, configs[config]) : value;
            }
            else if (System.isObject(config)) {
                objectEach(config, function update(value, option) {
                    ConfigsManager.update(option, value);
                });
            }
        },
        /**
        * @access public
        *
        * @memberof JARS~ConfigsManager
        *
        * @param {String} option
        *
        * @return {*}
        */
        get: function(option) {
            return configs[option];
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
            JARS.mods = getLoader().getRoot();
        }
    }

    function getLoader() {
        return getInternal('Loader');
    }

    return ConfigsManager;
});
