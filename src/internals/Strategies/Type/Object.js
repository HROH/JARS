JARS.internal('Strategies/Type/Object', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Object').each,
        AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        StringResolutionStrategy = getInternal('Strategies/Type/String'),
        NestedResolutionStrategy = getInternal('Strategies/Resolution/Nested');

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {Object<string, JARS~internals.Subjects~Declaration>} subjects
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {JARS~internals.Subjects.Subject[]}
     */
    function Object(subject, requestor, subjects, resolutionStrategy) {
        var resolvedSubjects = [];

        each(subjects, function(nestedSubjects, nestedSubjectName) {
            var nestedSubject = StringResolutionStrategy(subject, requestor, nestedSubjectName, resolutionStrategy)[0];

            if(nestedSubject) {
                resolvedSubjects = resolvedSubjects.concat(AnyResolutionStrategy(nestedSubject, requestor, nestedSubjects, NestedResolutionStrategy));
            }
        });

        return resolvedSubjects;
    }

    return Object;
});
