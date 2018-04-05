JARS.internal('Resolvers/Relative', function() {
    'use strict';

    var DOT = '.',
        Relative;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Relative = {
        /**
         * @param {string} subjectName
         *
         * @return {boolean}
         */
        is: function(subjectName) {
            return subjectName.indexOf(DOT) === 0;
        },
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        make: function(subjectName) {
            return DOT + subjectName;
        }
    };

    return Relative;
});
