JARS.internal('Strategies/Resolution/Nested', function(getInternal) {
    'use strict';

    var isRoot = getInternal('Resolvers/Subjects/Module').isRoot,
        AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute'),
        DOT = '.',
        MSG_NESTED_RESOLUTION_ERROR = 'a nested module must contain "." only as a special symbol';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {JARS~internals.Strategies.Resolution~Data}
     */
    function Nested(subject, subjectName) {
        return subjectName !== DOT ? AbsoluteResolutionStrategy(subject, subjectName) : isRoot(subject.name) ? {
            error: MSG_NESTED_RESOLUTION_ERROR
        } : {
            name: subject.name
        };
    }

    return Nested;
});
