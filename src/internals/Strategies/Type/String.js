JARS.internal('Strategies/Type/String', function(getInternal) {
    'use strict';

    var SubjectsRegistry = getInternal('Registries/Subjects'),
        InterceptionResolver = getInternal('Resolvers/Interception'),
        MSG_DEFAULT_RESOLUTION_ERROR = 'could not resolve "${0}": ';

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {string} subjectName
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {JARS~internals.Subjects.Subject[]}
     */
    function String(subject, requestor, subjectName, resolutionStrategy) {
        var info = InterceptionResolver.getInfo(subjectName),
            result = resolutionStrategy(subject, info.name);

        result.error && subject.abort(MSG_DEFAULT_RESOLUTION_ERROR + result.error, [subjectName]);

        return result.name ? [SubjectsRegistry.get(InterceptionResolver.makeInterception(result.name, info), requestor)] : [];
    }

    return String;
});
