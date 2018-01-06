/**
 * @module System.Formatter
 * @see JARS~internals.System.Formatter
 */
JARS.module('System.Formatter').$import([
    '.::$$internals', '.::isString', '.::isArray', '.::isObject'
]).$export(function(internals, isString, isArray, isObject) {
    'use strict';

    var hasOwnProp = internals.get('Helpers/Object').hasOwnProp,
        RE_TEMPLATE_KEY = /\$\{(.*?)\}/g,
        UNKNOWN_KEY = '<UNKNOWN KEY>',
        Formatter;

    /**
     * @namespace
     *
     * @memberof JARS~internals.System
     */
    Formatter = {
        /**
         * @param {string} message
         * @param {(Object<string, string>|string[])} data
         *
         * @return {string}
         */
        format: function(message, data) {
            if (isString(message) && (isObject(data) || isArray(data))) {
                formatReplace.data = data;

                message = message.replace(RE_TEMPLATE_KEY, formatReplace);

                formatReplace.data = null;
            }

            return message;
        }
    };

    /**
     * @memberof JARS~internals.System.Formatter
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
