JARS.internal('Configs/Subject', function(getInternal) {
    'use strict';

    var Options = getInternal('Configs/Options');

    /**
     * @class
     *
     * @memberof JARS~internals.Configs
     *
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     * @param {JARS~internals.Configs.Subject} [parentConfig]
     */
    function Subject(subject, parentConfig) {
        var config = this;

        config.parentConfig = parentConfig;
        config._subject = subject;
        config._options = parentConfig ? parentConfig.inheritOptions() : new Options();
        config._defaultOptions = Options.getDefault(subject);
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            Options.transformAndUpdate(this._options, newOptions, this._subject);
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
         * @return {JARS~internals.Configs.Options}
         */
        inheritOptions: function() {
            return Options.childOf(this._options);
        }
    };

    /**
     * @param {JARS~internals.Module} module
     *
     * @return {JARS~internals.Configs.Subject}
     */
    Subject.forModule = function(module) {
        var parentConfig = module.bundle.config;

        return module.isRoot ? parentConfig : new Subject(module, parentConfig);
    };

    /**
     * @param {JARS~internals.Bundle} bundle
     *
     * @return {JARS~internals.Configs.Subject}
     */
    Subject.forBundle = function(bundle) {
        var parent = bundle.module.deps.parent;

        return new Subject(bundle, parent && parent.bundle.config);
    };

    return Subject;
});
