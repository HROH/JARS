JARS.internal('ConfigsManager', function configsManagerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        utils = getInternal('utils'),
        objectEach = utils.objectEach,
        arrayEach = utils.arrayEach,
        objectMerge = utils.objectMerge,
        System = getInternal('System'),
        Loader = getInternal('Loader'),
        Resolver = getInternal('Resolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        SourceManager = getInternal('SourceManager'),
        configs = {
            environments: {},

            globalAccess: false,

            supressErrors: false
        },
        configHooks = {
            /**
             * @param {(Object|Boolean)} debugConfig
             */
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
             * @param {(Object|Object[])} newModuleConfigs
             */
            modules: function setModuleConfigs(newModuleConfigs) {
                var modules;

                if (System.isArray(newModuleConfigs)) {
                    arrayEach(newModuleConfigs, function setModuleConfig(config) {
                        setModuleConfigs(config);
                    });
                }
                else {
                    modules = newModuleConfigs.restrict ? Resolver.resolve(newModuleConfigs.restrict) : [Resolver.getRootName()];

                    arrayEach(modules, function updateModuleConfig(moduleName) {
                        var module = Loader.getModule(moduleName);

                        (Resolver.isBundle(moduleName) ? module.bundle : module).config.update(newModuleConfigs);
                    });
                }
            },
            /**
             * @param {String} newLoaderContext
             * @param {String} oldLoaderContext
             *
             * @return {String}
             */
            loaderContext: function(newLoaderContext, oldLoaderContext) {
                if (newLoaderContext !== oldLoaderContext) {
                    newLoaderContext = Loader.setLoaderContext(newLoaderContext);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newLoaderContext;
            },
            /**
             * @param {JARS~InterceptionManager~Interceptor[]} newInterceptors
             */
            interceptors: function(newInterceptors) {
                if (System.isArray(newInterceptors)) {
                    arrayEach(newInterceptors, InterceptionManager.addInterceptor);
                }
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
        * @param {(Object|String)} optionOrConfig
        * @param {*} [value]
        */
        update: function(optionOrConfig, value) {
            var configHook;

            if (System.isString(optionOrConfig)) {
                configHook = configHooks[optionOrConfig];
                configs[optionOrConfig] = System.isFunction(configHook) ? configHook(value, configs[optionOrConfig]) : value;
            }
            else if (System.isObject(optionOrConfig)) {
                objectEach(optionOrConfig, function update(value, option) {
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
            JARS.mods = Loader.getRoot();
        }
    }

    return ConfigsManager;
});
