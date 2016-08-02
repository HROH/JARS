JAR.internal('Config', function configSetup(InternalsManager) {
    var MIN_TIMEOUT = 0.5,
        STRING_CHECK = 'String',
        OBJECT_CHECK = 'Object',
        BOOLEAN_CHECK = 'Boolean',
        utils = InternalsManager.get('utils'),
        hasOwnProp = utils.hasOwnProp,
        objectMerge = utils.objectMerge,
        objectEach = utils.objectEach,
        configTransforms = {},
        Resolver = InternalsManager.get('Resolver');

    addConfigTransform('basePath', STRING_CHECK, Resolver.ensureEndsWithSlash);

    addConfigTransform('cache', BOOLEAN_CHECK, function cacheTransform(cache) {
        return !!cache;
    });

    addConfigTransform('checkCircularDeps', BOOLEAN_CHECK);

    addConfigTransform('config', OBJECT_CHECK, function configTransform(newConfig, module, forBundle) {
        return objectMerge(module[forBundle ? 'bundleConfig' : 'config'].get('config'), newConfig);
    });

    addConfigTransform('dirPath', STRING_CHECK, Resolver.ensureEndsWithSlash);

    addConfigTransform('fileName', STRING_CHECK);

    addConfigTransform('minified', BOOLEAN_CHECK, function minTransform(loadMin) {
        return loadMin ? '.min' : '';
    });

    addConfigTransform('recover', OBJECT_CHECK, function recoverTransform(recoverConfig, module, forBundle) {
        // create a copy of the recover-config
        // because it should update for every module independendly
        var recover = objectMerge({}, recoverConfig);

        recover.restrict = module.getName(forBundle);
        // if no next recover-config is given set it explicitly
        // this is important because the recoverflow is as follows:
        // - if the module has a recover-config, use it to update its config
        // - if it has no recover-config look for it in a higher bundle-config
        // - if such a config is found, update the config for the module
        // - when the module-config is updated, options will always be overwritten but never deleted
        // So if the module has a recover-config that doesn't get replaced
        // it may repeatedly try to recover with this config
        recover.recover || (recover.recover = null);

        return recover;
    });

    addConfigTransform('timeout', 'Number', function timeoutTransform(timeout) {
        return (timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT) * 1000;
    });

    addConfigTransform('versionDir', STRING_CHECK, Resolver.ensureEndsWithSlash);

    /**
     * @access private
     *
     * @constructor Config
     *
     * @memberof JAR
     * @inner
     *
     * @param {JAR~Module} module
     * @param {Boolean} isBundleConfig
     * @param {JAR~Config} parentConfig
     */
    function Config(module, isBundleConfig, parentConfig) {
        this.module = module;
        this.isBundleConfig = isBundleConfig;
        this.defaultOptions = Resolver.getPathOptions(module.name);
        this.parentConfig = parentConfig;
        this.options = parentConfig ? parentConfig.inheritOptions() : new ConfigOptions();
    }

    Config.prototype = {
        /**
         * @access public
         *
         * @alias JAR~Config
         *
         * @memberof JAR~Config#
         */
        constructor: Config,
        /**
         * @access public
         *
         * @memberof JAR~Config#
         *
         * @param {Object} newOptions
         *
         * @return {Object}
         */
        update: function(newOptions) {
            var config = this,
                options = config.options,
                module = config.module,
                System = module.loader.getSystem();

            objectEach(newOptions, function updateConfig(value, option) {
                var transform, transformFn;

                if (hasOwnProp(configTransforms, option)) {
                    transform = configTransforms[option];
                    transformFn = transform.transform;

                    if (System.isFunction(value)) {
                        value = value(options[option], module);
                    }

                    if (System['is' + transform.check](value)) {
                        options[option] = transformFn ? transformFn(value, module, config.isBundleConfig) : value;
                    }
                    else if (System.isNull(value)) {
                        delete options[option];
                    }
                }
            });
        },
        /**
         * @access public
         *
         * @memberof JAR~Config#
         *
         * @param {String} option
         * @param {String} skipUntil
         *
         * @return {*}
         */
        get: function(option, skipUntil) {
            var config = this,
                module = config.module,
                loader = module.loader,
                defaultValue = config.defaultOptions[option],
                options = config.options,
                result;

            if (skipUntil && !hasOwnProp(options, option)) {
                options = loader.getModule(skipUntil).bundleConfig.inheritOptions();
            }

            if (option in options) {
                result = options[option];
            }
            else {
                result = defaultValue;
            }

            return result;
        },
        /**
         * @access public
         *
         * @memberof JAR~Config#
         *
         * @param {String} moduleName
         *
         * @return {JAR~ConfigOptions}
         */
        inheritOptions: function() {
            return create(ConfigOptions, this.options);
        }
    };

    /**
     * @callback transformFunction
     *
     * @access private
     *
     * @memberof JAR~Config
     * @inner
     *
     * @param {*} configValue
     * @param {JAR~Module} [module]
     * @param {Boolean} [forBundle]
     */

    /**
     * @access private
     *
     * @memberof JAR~Config
     * @inner
     *
     * @param {String} configKey
     * @param {String} typeCheck
     * @param {transformFunction} [transform]
     */
    function addConfigTransform(configKey, typeCheck, transform) {
        configTransforms[configKey] = {
            check: typeCheck,

            transform: transform
        };
    }

    function create(Constructor, newProto) {
        var oldProto = Constructor.prototype, object;

        newProto && (Constructor.prototype = newProto);

        object = new Constructor();

        newProto && (Constructor.prototype = oldProto);

        return object;
    }

    /**
     * @access private
     *
     * @memberof JAR~Config
     * @inner
     */
    function ConfigOptions() {
        this.config = create(PublicConfig, this.config);
    }

    /**
     * @access private
     *
     * @memberof JAR~Config
     * @inner
     */
    function PublicConfig() {}

    return Config;
});
