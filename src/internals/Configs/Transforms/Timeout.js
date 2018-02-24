JARS.internal('Configs/Transforms/Timeout', function() {
    'use strict';

    var MIN_TIMEOUT = 0.5;

    /**
     * @memberof JARS~internals.Configs.Transforms
     *
     * @param {number} timeout
     *
     * @return {number}
     */
    function Timeout(timeout) {
        return timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT;
    }

    return Timeout;
});
