JARS.internal('ModuleConfig', function moduleConfigSetup(InternalsManager) {
    'use strict';

    var MIN_TIMEOUT = 0.5,
        STRING_CHECK = 'String',
        OBJECT_CHECK = 'Object',
        BOOLEAN_CHECK = 'Boolean',
        RE_END_SLASH = /\/$/,
        RE_DOT = /\./g,
        SLASH = '/',
        DEFAULT_EXTENSION = 'js',
        getInternal = InternalsManager.get,
        utils = getInternal('utils'),
        hasOwnProp = utils.hasOwnProp,
        objectMerge = utils.objectMerge,
        objectEach = utils.objectEach,
        configTransforms = {},
        Resolver = getInternal('Resolver'),
        System = getInternal('System');

    addConfigTransform('basePath', STRING_CHECK, ensureEndsWithSlash);

    addConfigTransform('cache', BOOLEAN_CHECK, function cacheTransform(cache) {
        return !!cache;
    });

    addConfigTransform('checkCircularDeps', BOOLEAN_CHECK);

    addConfigTransform('config', OBJECT_CHECK, function configTransform(newConfig, moduleOrBundle) {
        return objectMerge(moduleOrBundle.config.get('config'), newConfig);
    });

    addConfigTransform('dirPath', STRING_CHECK, ensureEndsWithSlash);

    addConfigTransform('extension', STRING_CHECK, function extensionTransform(extension) {
        return '.' + extension;
    });

    addConfigTransform('fileName', STRING_CHECK);

    addConfigTransform('minified', BOOLEAN_CHECK, function minTransform(loadMin) {
        return loadMin ? '.min' : '';
    });

    addConfigTransform('recover', OBJECT_CHECK, function recoverTransform(recoverConfig, moduleOrBundle) {
        // create a copy of the recover-config
        // because it should update for every module independently
        var recover = objectMerge({}, recoverConfig);

        recover.restrict = moduleOrBundle.name;
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
        return (timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT);
    });

    addConfigTransform('versionDir', STRING_CHECK, ensureEndsWithSlash);

    /**
     * @access public
     *
     * @constructor ModuleConfig
     *
     * @memberof JARS
     * @inner
     *
     * @param {(JARS~Module|JARS~Bundle)} moduleOrBundle
     * @param {JARS~ModuleConfig} [parentConfig]
     */
    function ModuleConfig(moduleOrBundle, parentConfig) {
        var moduleConfig = this;

        moduleConfig._moduleOrBundle = moduleOrBundle;
        moduleConfig._parentConfig = parentConfig;
        moduleConfig._options = parentConfig ? parentConfig.inheritOptions() : new ModuleConfigOptions();
        moduleConfig._defaultOptions = getDefaultOptions(moduleOrBundle);
    }

    ModuleConfig.prototype = {
        /**
         * @access public
         *
         * @alias JARS~ModuleConfig
         *
         * @memberof JARS~ModuleConfig#
         */
        constructor: ModuleConfig,
        /**
         * @access public
         *
         * @memberof JARS~ModuleConfig#
         *
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            var moduleConfig = this;

            transformAndUpdateOptions(moduleConfig._options, newOptions, moduleConfig._moduleOrBundle);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleConfig#
         *
         * @param {String} option
         * @param {String} skipUntil
         *
         * @return {*}
         */
        get: function(option, skipUntil) {
            var moduleConfig = this,
                Loader = getInternal('Loader'),
                options = moduleConfig._options,
                defaultValue = moduleConfig._defaultOptions[option],
                result;

            if (skipUntil && !hasOwnProp(options, option)) {
                options = Loader.getModule(skipUntil).bundle.config.inheritOptions();
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
         * @memberof JARS~ModuleConfig#
         *
         * @return {JARS~ModuleConfig~ModuleConfigOptions}
         */
        inheritOptions: function() {
            return create(ModuleConfigOptions, this._options);
        }
    };

    /**
     * @callback TransformFunction
     *
     * @access private
     *
     * @memberof JARS~ModuleConfig
     * @inner
     *
     * @param {*} configValue
     * @param {(JARS~Module|JARS~Bundle)} [moduleOrBundle]
     */

    /**
     * @access private
     *
     * @memberof JARS~ModuleConfig
     * @inner
     *
     * @param {String} configKey
     * @param {String} typeCheck
     * @param {JARS~ModuleConfig~TransformFunction} [transform]
     */
    function addConfigTransform(configKey, typeCheck, transform) {
        configTransforms[configKey] = {
            check: typeCheck,

            transform: transform
        };
    }

    /**
     * @access private
     *
     * @memberof JARS~ModuleConfig
     * @inner
     *
     * @param {String} path
     *
     * @return {String}
     */
    function ensureEndsWithSlash(path) {
        return (!path || RE_END_SLASH.test(path)) ? path : path + SLASH;
    }

    /**
     * @access private
     *
     * @memberof JARS~ModuleConfig
     * @inner
     *
     * @param {JARS~ModuleConfig~ModuleConfigOptions} oldOptions
     * @param {Object} newOptions
     * @param {(JARS~Module|JARS~Bundle)} moduleOrBundle
     */
    function transformAndUpdateOptions(oldOptions, newOptions, moduleOrBundle) {
        objectEach(newOptions, function updateConfig(value, option) {
            var transform, transformFn;

            if (hasOwnProp(configTransforms, option)) {
                transform = configTransforms[option];
                transformFn = transform.transform;

                if (System.isFunction(value)) {
                    value = value(oldOptions[option], moduleOrBundle);
                }

                if (System['is' + transform.check](value)) {
                    oldOptions[option] = transformFn ? transformFn(value, moduleOrBundle) : value;
                }
                else if (System.isNull(value)) {
                    delete oldOptions[option];
                }
            }
        });
    }

    /**
     * @access private
     *
     * @memberof JARS~ModuleConfig
     * @inner
     *
     * @param {(JARS~Module|JARS~Bundle)} moduleOrBundle
     *
     * @return {JARS~ModuleConfig~ModuleConfigOptions}
     */
    function getDefaultOptions(moduleOrBundle) {
        var moduleOrBundleName = moduleOrBundle.name,
            defaultOptions = new ModuleConfigOptions(),
            fileName, firstLetterFileName, isLowerCaseFile;

        if(!Resolver.isBundle(moduleOrBundleName)) {
            fileName = Resolver.getModuleTail(moduleOrBundleName),
            firstLetterFileName = fileName.charAt(0),
            isLowerCaseFile = firstLetterFileName === firstLetterFileName.toLowerCase();

            transformAndUpdateOptions(defaultOptions, {
                extension: DEFAULT_EXTENSION,

                fileName: fileName,

                dirPath: Resolver.getModuleNameWithoutVersion(isLowerCaseFile ? moduleOrBundleName : Resolver.getImplicitDependencyName(moduleOrBundleName)).replace(RE_DOT, SLASH),

                versionDir: Resolver.getVersion(moduleOrBundleName)
            }, moduleOrBundle);
        }

        return defaultOptions;
    }

    /**
     * @access private
     *
     * @memberof JARS~ModuleConfig
     * @inner
     *
     * @param {Function()} Constructor
     * @param {Object} [newProto]
     *
     * @return {Object}
     */
    function create(Constructor, newProto) {
        var oldProto = Constructor.prototype, object;

        newProto && (Constructor.prototype = newProto);

        object = new Constructor();

        newProto && (Constructor.prototype = oldProto);

        return object;
    }

    /**
     * @access public
     *
     * @constructor ModuleConfigOptions
     *
     * @memberof JARS~ModuleConfig
     * @inner
     */
    function ModuleConfigOptions() {
        this.config = create(PublicModuleConfig, this.config);
    }

    /**
     * @access public
     *
     * @constructor PublicModuleConfig
     *
     * @memberof JARS~ModuleConfig
     * @inner
     */
    function PublicModuleConfig() {}

    return ModuleConfig;
});
