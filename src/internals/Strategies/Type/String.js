JARS.internal('Strategies/Type/String', function(getInternal) {
    'use strict';

    var Injector = getInternal('Registries/Injector'),
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
        var result = resolutionStrategy(subject, subjectName);

        result.error && subject.abort(MSG_DEFAULT_RESOLUTION_ERROR + result.error, [subjectName]);

        return result.name ? [Injector.getSubject(result.name, requestor)] : [];
    }

    return String;
});
