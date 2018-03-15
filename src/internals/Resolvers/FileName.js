JARS.internal('Resolvers/FileName', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('Resolvers/Version').removeVersion,
        DOT = '.';

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} subjectName
     *
     * @return {string}
     */
    function FileName(subjectName) {
        subjectName = removeVersion(subjectName);

        return subjectName.substr(subjectName.lastIndexOf(DOT) + 1);
    }

    return FileName;
});
