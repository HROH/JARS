JARS.internal('Resolvers/Relative', function() {
    'use strict';

    var RE_LEADING_DOT = /^\./,
        RelativeResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    RelativeResolver = {
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isRelative: function(moduleName) {
            return RE_LEADING_DOT.test(moduleName);
        }
    };

    return RelativeResolver;
});
