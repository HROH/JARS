JARS.internal('ConfigOptions', function(getInternal) {
    'use strict';

    var ConfigOptionsResolver = getInternal('Resolvers/ConfigOptions'),
        ConfigTransforms = getInternal('ConfigTransforms'),
        ObjectHelper = getInternal('Helpers/Object'),
        create = ObjectHelper.create,
        hasOwnProp = ObjectHelper.hasOwnProp,
        each = ObjectHelper.each,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        isNull = getInternal('System').isNull;

    /**
     * @class
     *
     * @memberof JARS~internals.Config
     */
    function Options() {
        this.config = create(PublicConfig, this.config);
    }

    /**
     * @class
     *
     * @memberof JARS~internals.Config.Options
     * @inner
     */
    function PublicConfig() {}


    /**
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     *
     * @return {JARS~internals.Config.Options}
     */
    Options.getDefault = function(subject) {
        var defaultOptions = new Options();

        isBundle(subject.name) || Options.transformAndUpdate(defaultOptions, ConfigOptionsResolver(subject.name), subject);

        return defaultOptions;
    };

    /**
     * @param {JARS~internals.Config.Options} configOptions
     * @param {Object} options
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     */
    Options.transformAndUpdate = function(configOptions, options, subject) {
        each(options, function updateConfig(value, option) {
            if (hasOwnProp(ConfigTransforms, option)) {
                updateOption(configOptions, option, transformOption(option, value, subject));
            }
        });
    };

    /**
     * @memberof JARS~internals.Config.Options
     * @inner
     *
     * @param {string} option
     * @param {*} value
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     *
     * @return {*}
     */
    function transformOption(option, value, subject) {
        return ConfigTransforms[option](value, subject);
    }

    /**
     * @memberof JARS~internals.Config.Options
     * @inner
     *
     * @param {JARS~internals.Config.Options} configOptions
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

    return Options;
});
