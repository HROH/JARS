JARS.internal('Strategies/Type/Array', function(getInternal) {
    'use strict';

    var reduce = getInternal('Helpers/Array').reduce,
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
        return reduce(subjects, function(resolvedSubjects, nestedSubjects) {
            return resolvedSubjects.concat(AnyResolutionStrategy(subject, requestor, nestedSubjects, resolutionStrategy));
        }, []);
    }

    return Array;
});
