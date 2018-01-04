JARS.internal('ConfigOptions', function configOptionsSetup(getInternal) {
    'use strict';

    var ConfigOptionsResolver = getInternal('Resolvers/ConfigOptions'),
        ConfigTransforms = getInternal('ConfigTransforms'),
        Utils = getInternal('Utils'),
        create = Utils.create,
        hasOwnProp = Utils.hasOwnProp,
        objectEach = Utils.objectEach,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        isNull = getInternal('System').isNull;

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
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} subject
     *
     * @return {JARS.internals.ConfigOptions}
     */
    ConfigOptions.getDefault = function(subject) {
        var defaultOptions = new ConfigOptions();

        isBundle(subject.name) || ConfigOptions.transformAndUpdate(defaultOptions, ConfigOptionsResolver(subject.name), subject);

        return defaultOptions;
    };

    /**
     * @memberof JARS.internals.ConfigOptions
     *
     * @param {JARS.internals.ConfigOptions} configOptions
     * @param {Object} options
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} subject
     */
    ConfigOptions.transformAndUpdate = function(configOptions, options, subject) {
        objectEach(options, function updateConfig(value, option) {
            if (hasOwnProp(ConfigTransforms, option)) {
                updateOption(configOptions, option, transformOption(option, value, subject));
            }
        });
    };

    /**
     * @memberof JARS.internals.ConfigOptions
     * @inner
     *
     * @param {string} option
     * @param {*} value
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} subject
     *
     * @return {*}
     */
    function transformOption(option, value, subject) {
        return ConfigTransforms[option](value, subject);
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
        if (isNull(value)) {
            delete configOptions[option];
        }
        else {
            configOptions[option] = value;
        }
    }

    return ConfigOptions;
});
