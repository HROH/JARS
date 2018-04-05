JARS.internal('Strategies/Resolution/Subject', function(getInternal) {
    'use strict';

    var RelativeResolutionStrategy = getInternal('Strategies/Resolution/Relative'),
        isRelative = getInternal('Resolvers/Relative').is,
        MSG_DEPENDENCY_RESOLUTION_ERROR = 'a dependency module must be absolute or relative to the base module';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {JARS~internals.Strategies.Resolution~Data}
     */
    function Subject(subject, subjectName) {
        return isRelative(subjectName) ? RelativeResolutionStrategy(subject, subjectName) : subjectName ? {
            name: subjectName
        } : {
            error: MSG_DEPENDENCY_RESOLUTION_ERROR
        };
    }

    return Subject;
});
