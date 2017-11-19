JARS.internal('Config', function configSetup(getInternal) {
    'use strict';

    var create = getInternal('Utils').create,
        ConfigOptions = getInternal('ConfigOptions');

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
        config._defaultOptions = ConfigOptions.getDefault(moduleOrBundle);
    }

    Config.prototype = {
        constructor: Config,
        /**
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            var config = this;

            ConfigOptions.transformAndUpdate(config._options, newOptions, config._moduleOrBundle);
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

    return Config;
});
