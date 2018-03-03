JARS.internal('Strategies/Type/String', function(getInternal) {
    'use strict';

    var SubjectsRegistry = getInternal('Registries/Subjects'),
        extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
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
        var info = extractInterceptionInfo(subjectName),
            result = resolutionStrategy(subject, info.moduleName);

        abortOnResolutionError(subject.state, result.error, subjectName);

        return result.name ? [SubjectsRegistry.get(result.name + (info.type ? (info.type + info.data) : ''), requestor)] : [];
    }

    /**
     * @memberof JARS~internals.Strategies.Type.String
     * @inner
     *
     * @param {JARS~internals.States.Subject} state
     * @param {string} error
     * @param {string} subjectName
     */
    function abortOnResolutionError(state, error, subjectName) {
        error && state.setAborted(MSG_DEFAULT_RESOLUTION_ERROR + error, [subjectName]);
    }

    return String;
});
