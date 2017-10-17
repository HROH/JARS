JARS.internal('TimeoutTransform', function timeoutTransformSetup() {
    'use strict';

    var MIN_TIMEOUT = 0.5,
        TimeoutTransform;

    /**
     * @memberof JARS.internals
     */
    TimeoutTransform = {
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

    return TimeoutTransform;
});
