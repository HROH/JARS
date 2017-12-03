JARS.internal('ConfigTransforms/Cache', function() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var Cache = {
        type: 'boolean',
        /**
         * @param {string} cache
         *
         * @return {string}
         */
        transform: function(cache) {
            return cache ? '' : '?_=' + new Date().getTime();
        }
    };

    return Cache;
});
