JARS.internal('ConfigTransforms/Timeout', function timeoutTransformSetup() {
    'use strict';

    var MIN_TIMEOUT = 0.5,
        Timeout;

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    Timeout = {
        /**
         * @type {string}
         */
        type: 'number',
        /**
         * @param {number} timeout
         *
         * @return {number}
         */
        transform: function(timeout) {
            return (timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT);
        }
    };

    return Timeout;
});
