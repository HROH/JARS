JARS.internal('Config', function(getInternal) {
    'use strict';

    var create = getInternal('Helpers/Object').create,
        ConfigOptions = getInternal('ConfigOptions');

    /**
     * @class
     *
     * @memberof JARS~internals
     *
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     * @param {JARS~internals.Config} [parentConfig]
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
            return (option in this._options) ? this._options[option] : this._defaultOptions[option];
        },
        /**
         * @return {JARS~internals.Config.Options}
         */
        inheritOptions: function() {
            return create(ConfigOptions, this._options);
        }
    };

    /**
     * @param {JARS~internals.Module} module
     *
     * @return {JARS~internals.Config}
     */
    Config.forModule = function(module) {
        var parentConfig = module.bundle.config;

        return module.isRoot ? parentConfig : new Config(module, parentConfig);
    };

    /**
     * @param {JARS~internals.Bundle} bundle
     *
     * @return {JARS~internals.Config}
     */
    Config.forBundle = function(bundle) {
        var parent = bundle.module.deps.parent;

        return new Config(bundle, parent && parent.bundle.config);
    };

    return Config;
});
