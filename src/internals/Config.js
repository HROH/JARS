JARS.internal('Config', function configSetup(getInternal) {
    'use strict';

    var create = getInternal('Utils').create,
        ConfigOptions = getInternal('ConfigOptions');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} subject
     * @param {JARS.internals.Config} [parentConfig]
     */
    function Config(subject, parentConfig) {
        var config = this;

        config.parentConfig = parentConfig;
        config._subject = subject;
        config._options = parentConfig ? parentConfig.inheritOptions() : new ConfigOptions();
        config._defaultOptions = ConfigOptions.getDefault(subject);
    }

    Config.prototype = {
        constructor: Config,
        /**
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            ConfigOptions.transformAndUpdate(this._options, newOptions, this._subject);
        },
        /**
         * @param {string} option
         *
         * @return {*}
         */
        get: function(option) {
            var options = this._options;

            return (option in options) ? options[option]: this._defaultOptions[option];
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
