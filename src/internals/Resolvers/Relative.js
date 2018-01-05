JARS.internal('Resolvers/Relative', function() {
    'use strict';

    var RE_LEADING_DOT = /^\./;

    /**
     * @memberof JARS.internals
     *
     * @param {string} moduleName
     *
     * @return {boolean}
     */
    function RelativeResolver(moduleName) {
        return RE_LEADING_DOT.test(moduleName);
    }

    return RelativeResolver;
});
