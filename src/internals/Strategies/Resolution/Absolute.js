JARS.internal('Strategies/Resolution/Absolute', function(getInternal) {
    'use strict';

    var VersionResolutionStrategy = getInternal('Strategies/Resolution/Version'),
        RelativeResolver = getInternal('Resolvers/Relative'),
        MSG_ABSOLUTE_RESOLUTION_ERROR = 'a module can not be resolved beyond the root';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {JARS~internals.Strategies.Resolution~Data}
     */
    function Absolute(subject, subjectName) {
        return subject.isRoot || RelativeResolver(subjectName) ? {
            error: MSG_ABSOLUTE_RESOLUTION_ERROR
        } : VersionResolutionStrategy(subject, subjectName);
    }

    return Absolute;
});
