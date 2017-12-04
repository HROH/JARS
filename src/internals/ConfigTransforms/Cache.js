JARS.internal('ConfigTransforms/Cache', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    var Cache = {
        /**
         * @type {string}
         */
        type: 'boolean',
        /**
         * @param {boolean} cache
         *
         * @return {string}
         */
        transform: function(cache) {
            return cache ? '' : '?_=' + new Date().getTime();
        }
    };

    return Cache;
});
