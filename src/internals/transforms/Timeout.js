JARS.internal('transforms/Timeout', function timeoutTransformSetup() {
    'use strict';

    var MIN_TIMEOUT = 0.5,
        Timeout;

    /**
     * @memberof JARS.internals
     */
    Timeout = {
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
