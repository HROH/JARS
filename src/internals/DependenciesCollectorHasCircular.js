JARS.internal('DependenciesCollectorHasCircular', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var DependenciesCollectorHasCircular = {
        /**
         * @param {string} match
         *
         * @return {boolean}
         */
        match: function(match) {
            return !!match;
        },
        /**
         * @param {boolean} result
         *
         * @return {boolean}
         */
        recursiveMatch: function(result) {
            return !!result;
        }
    };

    return DependenciesCollectorHasCircular;
});
