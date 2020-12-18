JARS.internal('Configs/Subject', function(getInternal) {
    'use strict';

    var Options = getInternal('Configs/Options'),
        hasOwnProp = getInternal('Helpers/Object').hasOwnProp;

    /**
     * @class
     *
     * @memberof JARS~internals.Configs
     *
     * @param {string} subjectName
     * @param {JARS~internals.Configs.Options} options
     */
    function Subject(subjectName, options) {
        this._subjectName = subjectName;
        this._options = options;
        this._defaultOptions = Options.getDefault(subjectName);
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {JARS~internals.Configs.Hooks~Modules} options
         */
        update: function(options) {
            Options.transformAndUpdate(this._options, options, this._subjectName);
        },
        /**
         * @param {string} option
         *
         * @return {*}
         */
        get: function(option) {
            var value = option in this._options ? this._options[option] : this._defaultOptions[option],
                transform = this._options[option + 'Transform'];

            return transform ? transform(value) : value;
        },
        /**
         * @param {string} option
         *
         * @return {*}
         */
        getOwn: function(option) {
            return hasOwnProp(this._options, option) ? this._options[option] : null;
        }
    };

    return Subject;
});
