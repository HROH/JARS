JARS.internal('Strategies/Resolution/Version', function(getInternal) {
    'use strict';

    var VersionResolver = getInternal('Resolvers/Version'),
        MSG_VERSION_RESOLUTION_ERROR = 'a version must only be added to the base module',
        DOT = '.';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {JARS~internals.Strategies.Resolution~Data}
     */
    function Version(subject, subjectName) {
        return VersionResolver.getVersion(subjectName) ? {
            error: MSG_VERSION_RESOLUTION_ERROR
        } : {
            name: VersionResolver.unwrapVersion(function(subjectBaseName) {
                return subjectBaseName + (subjectName ? DOT + subjectName : subjectName);
            })(subject.name)
        };
    }

    return Version;
});
