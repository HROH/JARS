JARS.internal('ConfigOptions', function configOptionsSetup(InternalsManager) {
    'use strict';

    var RE_DOT = /\./g,
        RE_STARTS_WITH_LOWERCASE = /^[a-z]/,
        DEFAULT_EXTENSION = 'js',
        SLASH = '/',
        getInternal = InternalsManager.get,
        BundleResolver = getInternal('BundleResolver'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        VersionResolver = getInternal('VersionResolver'),
        Utils = getInternal('Utils'),
        create = Utils.create,
        hasOwnProp = Utils.hasOwnProp,
        objectEach = Utils.objectEach,
        ConfigTransforms = getInternal('ConfigTransforms'),
        System = getInternal('System');

    /**
     * @class
     *
     * @memberof JARS.internals
     */
    function ConfigOptions() {
        this.config = create(PublicConfig, this.config);
    }

    /**
     * @class
     *
     * @memberof JARS.internals.ConfigOptions
     * @inner
     */
    function PublicConfig() {}


    /**
     * @memberof JARS.internals.ConfigOptions
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     *
     * @return {JARS.internals.ConfigOptions}
     */
    ConfigOptions.getDefault = function(moduleOrBundle) {
        var moduleOrBundleName = moduleOrBundle.name,
            defaultOptions = new ConfigOptions(),
            fileName;

        if(!BundleResolver.isBundle(moduleOrBundleName)) {
            fileName = VersionResolver.removeVersion(DependenciesResolver.removeParentName(moduleOrBundleName));

            ConfigOptions.transformAndUpdate(defaultOptions, {
                extension: DEFAULT_EXTENSION,

                fileName: fileName,

                dirPath: VersionResolver.removeVersion(RE_STARTS_WITH_LOWERCASE.test(fileName) ? moduleOrBundleName : DependenciesResolver.getParentName(moduleOrBundleName)).replace(RE_DOT, SLASH),

                versionDir: VersionResolver.getVersion(moduleOrBundleName)
            }, moduleOrBundle);
        }

        return defaultOptions;
    };

    /**
     * @memberof JARS.internals.ConfigOptions
     *
     * @param {JARS.internals.ConfigOptions} configOptions
     * @param {Object} options
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     */
    ConfigOptions.transformAndUpdate = function(configOptions, options, moduleOrBundle) {
        objectEach(options, function updateConfig(value, option) {
            if (hasOwnProp(ConfigTransforms, option)) {
                updateOption(configOptions, option, transformOption(option, value, moduleOrBundle));
            }
        });
    };

    /**
     * @memberof JARS.internals.ConfigOptions
     * @inner
     *
     * @param {string} option
     * @param {*} value
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     *
     * @return {*}
     */
    function transformOption(option, value, moduleOrBundle) {
        var transform = ConfigTransforms[option];

        return System.getType(value) === transform.type ? transform.transform(value, moduleOrBundle) : null;
    }

    /**
     * @memberof JARS.internals.ConfigOptions
     * @inner
     *
     * @param {JARS.internals.ConfigOptions} configOptions
     * @param {string} option
     * @param {*} value
     */
    function updateOption(configOptions, option, value) {
        if (System.isNull(value)) {
            delete configOptions[option];
        }
        else {
            configOptions[option] = value;
        }
    }

    return ConfigOptions;
});
