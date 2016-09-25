JARS.internal('Config', function configSetup(InternalsManager) {
    'use strict';

    var RE_DOT = /\./g,
        RE_STARTS_WITH_LOWERCASE = /^[a-z]/,
        DEFAULT_EXTENSION = 'js',
        SLASH = '/',
        getInternal = InternalsManager.get,
        Utils = getInternal('Utils'),
        create = Utils.create,
        hasOwnProp = Utils.hasOwnProp,
        objectEach = Utils.objectEach,
        ConfigOptions = getInternal('ConfigOptions'),
        ConfigTransforms = getInternal('ConfigTransforms'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        VersionResolver = getInternal('VersionResolver'),
        System = getInternal('System');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     * @param {JARS.internals.Config} [parentConfig]
     */
    function Config(moduleOrBundle, parentConfig) {
        var config = this;

        config.parentConfig = parentConfig;
        config._moduleOrBundle = moduleOrBundle;
        config._options = parentConfig ? parentConfig.inheritOptions() : new ConfigOptions();
        config._defaultOptions = getDefaultOptions(moduleOrBundle);
    }

    Config.prototype = {
        constructor: Config,
        /**
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            var config = this;

            transformAndUpdateOptions(config._options, newOptions, config._moduleOrBundle);
        },
        /**
         * @param {string} option
         *
         * @return {*}
         */
        get: function(option) {
            var config = this,
                options = config._options,
                defaultValue = config._defaultOptions[option],
                result;

            if (option in options) {
                result = options[option];
            }
            else {
                result = defaultValue;
            }

            return result;
        },
        /**
         * @return {JARS.internals.ConfigOptions}
         */
        inheritOptions: function() {
            return create(ConfigOptions, this._options);
        }
    };

    /**
     * @memberof JARS.internals.Config
     * @inner
     *
     * @param {JARS.internals.ConfigOptions} oldOptions
     * @param {Object} newOptions
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     */
    function transformAndUpdateOptions(oldOptions, newOptions, moduleOrBundle) {
        objectEach(newOptions, function updateConfig(value, option) {
            var transform;

            if (hasOwnProp(ConfigTransforms, option)) {
                transform = ConfigTransforms[option];

                if (System.isFunction(value)) {
                    value = value(oldOptions[option], moduleOrBundle);
                }
                else if (System['is' + transform.check](value)) {
                    oldOptions[option] = transform.transform(value, moduleOrBundle);
                }
                else if (System.isNull(value)) {
                    delete oldOptions[option];
                }
            }
        });
    }

    /**
     * @memberof JARS.internals.Config
     * @inner
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     *
     * @return {JARS.internals.ConfigOptions}
     */
    function getDefaultOptions(moduleOrBundle) {
        var moduleOrBundleName = moduleOrBundle.name,
            defaultOptions = new ConfigOptions(),
            fileName;

        if(!BundleResolver.isBundle(moduleOrBundleName)) {
            fileName = VersionResolver.removeVersion(DependenciesResolver.removeParentName(moduleOrBundleName));

            transformAndUpdateOptions(defaultOptions, {
                extension: DEFAULT_EXTENSION,

                fileName: fileName,

                dirPath: VersionResolver.removeVersion(RE_STARTS_WITH_LOWERCASE.test(fileName) ? moduleOrBundleName : DependenciesResolver.getParentName(moduleOrBundleName)).replace(RE_DOT, SLASH),

                versionDir: VersionResolver.getVersion(moduleOrBundleName)
            }, moduleOrBundle);
        }

        return defaultOptions;
    }

    return Config;
});
