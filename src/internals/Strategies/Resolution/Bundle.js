JARS.internal('Strategies/Resolution/Bundle', function(getInternal) {
    'use strict';

    var RelativeResolutionStrategy = getInternal('Strategies/Resolution/Relative'),
        RelativeResolver = getInternal('Resolvers/Relative'),
        MSG_BUNDLE_RESOLUTION_ERROR = 'a bundle module is already relative to the base module by default';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {{error: string, name: string}}
     */
    function Bundle(subject, subjectName) {
        return RelativeResolver(subjectName) ? {
            error: MSG_BUNDLE_RESOLUTION_ERROR
        } : RelativeResolutionStrategy(subject, '.' + subjectName);
    }

    return Bundle;
});
