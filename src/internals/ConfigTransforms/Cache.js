JARS.internal('ConfigTransforms/Cache', function() {
    'use strict';

    var EMPTY_STRING = '',
        CACHE_STRING = '?_=';

    /**
     * @memberof JARS~internals.Config.Transforms
     *
     * @param {boolean} cache
     *
     * @return {string}
     */
    function Cache(cache) {
        return cache ? EMPTY_STRING : CACHE_STRING + new Date().getTime();
    }

    return Cache;
});
