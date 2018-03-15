JARS.internal('Resolvers/Relative', function() {
    'use strict';

    var RE_LEADING_DOT = /^\./;

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} subjectName
     *
     * @return {boolean}
     */
    function Relative(subjectName) {
        return RE_LEADING_DOT.test(subjectName);
    }

    return Relative;
});
