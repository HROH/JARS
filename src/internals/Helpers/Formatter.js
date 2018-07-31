JARS.internal('Helpers/Formatter', function(getInternal) {
    'use strict';

    var Validators = getInternal('Types/Validators'),
        hasOwnProp = getInternal('Helpers/Object').hasOwnProp,
        RE_TEMPLATE_KEY = /\$\{(.*?)\}/g,
        UNKNOWN_KEY = '<UNKNOWN KEY>',
        Formatter;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Formatter = {
        /**
         * @param {string} message
         * @param {(Object<string, string>|string[])} data
         *
         * @return {string}
         */
        format: function(message, data) {
            if (Validators.isString(message) && (Validators.isObject(data) || Validators.isArray(data))) {
                formatReplace.data = data;

                message = message.replace(RE_TEMPLATE_KEY, formatReplace);

                formatReplace.data = null;
            }

            return message;
        }
    };

    /**
     * @memberof JARS~internals.Helpers.Formatter
     * @inner
     *
     * @param {array} match
     * @param {string} key
     *
     * @return {string}
     */
    function formatReplace(match, key) {
        var data = formatReplace.data;

        return hasOwnProp(data, key) ? data[key] : UNKNOWN_KEY;
    }

    return Formatter;
});
