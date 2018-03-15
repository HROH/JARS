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

        abortOnResolutionError(subject.stateUpdater, result.error, subjectName);

        return result.name ? [SubjectsRegistry.get(InterceptionResolver.makeInterception(result.name, info), requestor)] : [];
    }

    /**
     * @memberof JARS~internals.Strategies.Type.String
     * @inner
     *
     * @param {JARS~internals.States.Updater} stateUpdater
     * @param {string} error
     * @param {string} subjectName
     */
    function abortOnResolutionError(stateUpdater, error, subjectName) {
        error && stateUpdater.setAborted(MSG_DEFAULT_RESOLUTION_ERROR + error, [subjectName]);
    }

    return String;
});
