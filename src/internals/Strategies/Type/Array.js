JARS.internal('Strategies/Type/Array', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        AnyResolutionStrategy = getInternal('Strategies/Type/Any');

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {JARS~internals.Subjects~Declaration[]} subjects
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {JARS~internals.Subjects.Subject[]}
     */
    function Array(subject, requestor, subjects, resolutionStrategy) {
        var resolvedSubjects = [];

        each(subjects, function(nestedSubjects) {
            resolvedSubjects = resolvedSubjects.concat(AnyResolutionStrategy(subject, requestor, nestedSubjects, resolutionStrategy));
        });

        return resolvedSubjects;
    }

    return Array;
});
