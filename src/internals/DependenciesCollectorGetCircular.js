JARS.internal('DependenciesCollectorGetCircular', function() {
    'use strict';


    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var DependenciesCollectorGetCircular = {
        /**
         * @param {string} match
         *
         * @return {string[]}
         */
        match: function(match) {
            return [match];
        },
        /**
         * @param {string[]} result
         * @param {string} match
         *
         * @return {string[]}
         */
        recursiveMatch: function(result, match) {
            if(result.length) {
                result.unshift(match);

                return result;
            }
        }
    };

    return DependenciesCollectorGetCircular;
});
