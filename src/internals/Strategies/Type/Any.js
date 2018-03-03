JARS.internal('Strategies/Type/Any', function(getInternal) {
    'use strict';

    var getType = getInternal('Types/Lookup').get;

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {JARS~internals.Subjects~Declaration} subjects
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {JARS~internals.Subjects.Subject[]}
     */
    function Any(subject, requestor, subjects, resolutionStrategy) {
        return getInternal('Strategies/Type')[getType(subjects)](subject, requestor, subjects, resolutionStrategy);
    }

    return Any;
});
