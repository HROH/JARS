JARS.internal('Resolvers/Relative', function() {
    'use strict';

    var RE_LEADING_DOT = /^\./;

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} moduleName
     *
     * @return {boolean}
     */
    function Relative(moduleName) {
        return RE_LEADING_DOT.test(moduleName);
    }

    return Relative;
});
