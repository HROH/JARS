JARS.internal('Configs/Options', function(getInternal) {
    'use strict';

    var OptionsResolver = getInternal('Resolvers/Options'),
        Transforms = getInternal('Configs/Transforms'),
        ObjectHelper = getInternal('Helpers/Object'),
        create = ObjectHelper.create,
        hasOwnProp = ObjectHelper.hasOwnProp,
        each = ObjectHelper.each,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        isNull = getInternal('System').isNull;

    /**
     * @class
     *
     * @memberof JARS~internals.Configs
     */
    function Options() {
        this.config = create(PublicConfig, this.config);
    }

    /**
     * @class
     *
     * @memberof JARS~internals.Configs.Options
     * @inner
     */
    function PublicConfig() {}


    /**
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     *
     * @return {JARS~internals.Configs.Options}
     */
    Options.getDefault = function(subject) {
        var defaultOptions = new Options();

        isBundle(subject.name) || Options.transformAndUpdate(defaultOptions, OptionsResolver(subject.name), subject);

        return defaultOptions;
    };

    /**
     * @param {JARS~internals.Configs.Options} options
     * @param {Object} newOptions
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     */
    Options.transformAndUpdate = function(options, newOptions, subject) {
        each(newOptions, function updateConfig(value, option) {
            if (hasOwnProp(Transforms, option)) {
                updateOption(options, option, transformOption(option, value, subject));
            }
        });
    };

    /**
     * @memberof JARS~internals.Configs.Options
     * @inner
     *
     * @param {string} option
     * @param {*} value
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     *
     * @return {*}
     */
    function transformOption(option, value, subject) {
        return Transforms[option](value, subject);
    }

    /**
     * @memberof JARS~internals.Configs.Options
     * @inner
     *
     * @param {JARS~internals.Configs.Options} options
     * @param {string} option
     * @param {*} value
     */
    function updateOption(options, option, value) {
        if (isNull(value)) {
            delete options[option];
        }
        else {
            options[option] = value;
        }
    }

    return Options;
});
