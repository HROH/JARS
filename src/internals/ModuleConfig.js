JARS.internal('ModuleConfig', function moduleConfigSetup(InternalsManager) {
    'use strict';

    var RE_DOT = /\./g,
        DEFAULT_EXTENSION = 'js',
        SLASH = '/',
        getInternal = InternalsManager.get,
        Utils = getInternal('Utils'),
        create = Utils.create,
        hasOwnProp = Utils.hasOwnProp,
        objectEach = Utils.objectEach,
        ModuleConfigOptions = getInternal('ModuleConfigOptions'),
        ModuleConfigTransforms = getInternal('ModuleConfigTransforms'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        VersionResolver = getInternal('VersionResolver'),
        System = getInternal('System');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {(JARS.internals.Module|JARS.internals.ModuleBundle)} moduleOrBundle
     * @param {JARS.internals.ModuleConfig} [parentConfig]
     */
    function ModuleConfig(moduleOrBundle, parentConfig) {
        var moduleConfig = this;

        moduleConfig._moduleOrBundle = moduleOrBundle;
        moduleConfig._parentConfig = parentConfig;
        moduleConfig._options = parentConfig ? parentConfig.inheritOptions() : new ModuleConfigOptions();
        moduleConfig._defaultOptions = getDefaultOptions(moduleOrBundle);
    }

    ModuleConfig.prototype = {
        constructor: ModuleConfig,
        /**
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            var moduleConfig = this;

            transformAndUpdateOptions(moduleConfig._options, newOptions, moduleConfig._moduleOrBundle);
        },
        /**
         * @param {string} option
         * @param {string} skipUntil
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
         * @return {JARS.internals.ModuleConfigOptions}
         */
        inheritOptions: function() {
            return create(ModuleConfigOptions, this._options);
        }
    };

    /**
     * @memberof JARS.internals.ModuleConfig
     * @inner
     *
     * @param {JARS.internals.ModuleConfigOptions} oldOptions
     * @param {Object} newOptions
     * @param {(JARS.internals.Module|JARS.internals.ModuleBundle)} moduleOrBundle
     */
    function transformAndUpdateOptions(oldOptions, newOptions, moduleOrBundle) {
        objectEach(newOptions, function updateConfig(value, option) {
            var transform, transformFn;

            if (hasOwnProp(ModuleConfigTransforms, option)) {
                transform = ModuleConfigTransforms[option];
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
     * @memberof JARS.internals.ModuleConfig
     * @inner
     *
     * @param {(JARS.internals.Module|JARS.internals.ModuleBundle)} moduleOrBundle
     *
     * @return {JARS.internals.ModuleConfigOptions}
     */
    function getDefaultOptions(moduleOrBundle) {
        var moduleOrBundleName = moduleOrBundle.name,
            defaultOptions = new ModuleConfigOptions(),
            fileName, firstLetterFileName, isLowerCaseFile;

        if(!BundleResolver.isBundle(moduleOrBundleName)) {
            fileName = VersionResolver.removeVersion(DependenciesResolver.removeParentName(moduleOrBundleName));
            firstLetterFileName = fileName.charAt(0);
            isLowerCaseFile = firstLetterFileName === firstLetterFileName.toLowerCase();

            transformAndUpdateOptions(defaultOptions, {
                extension: DEFAULT_EXTENSION,

                fileName: fileName,

                dirPath: VersionResolver.removeVersion(isLowerCaseFile ? moduleOrBundleName : DependenciesResolver.getParentName(moduleOrBundleName)).replace(RE_DOT, SLASH),

                versionDir: VersionResolver.getVersion(moduleOrBundleName)
            }, moduleOrBundle);
        }

        return defaultOptions;
    }

    return ModuleConfig;
});
