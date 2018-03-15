JARS.internal('Configs/Subject', function(getInternal) {
    'use strict';

    var Options = getInternal('Configs/Options');

    /**
     * @class
     *
     * @memberof JARS~internals.Configs
     *
     * @param {string} subjectName
     * @param {JARS~internals.Configs.Options} options
     */
    function Subject(subjectName, options) {
        var config = this;

        config._subjectName = subjectName;
        config._options = options;
        config._defaultOptions = Options.getDefault(subjectName);
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {Object} newOptions
         */
        update: function(newOptions) {
            Options.transformAndUpdate(this._options, newOptions, this._subjectName);
        },
        /**
         * @param {string} option
         *
         * @return {*}
         */
        get: function(option) {
            return (option in this._options) ? this._options[option] : this._defaultOptions[option];
        }
    };

    return Subject;
});
