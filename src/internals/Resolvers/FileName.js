JARS.internal('Resolvers/FileName', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('Resolvers/Version').removeVersion,
        getInfo = getInternal('Resolvers/Subjects/Module').getInfo;

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} subjectName
     *
     * @return {string}
     */
    function FileName(subjectName) {
        return removeVersion(getInfo(subjectName).data);
    }

    return FileName;
});
