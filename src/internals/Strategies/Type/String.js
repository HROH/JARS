JARS.internal('Strategies/Type/String', function(getInternal) {
    'use strict';

    var extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
        MSG_DEFAULT_RESOLUTION_ERROR = ' - could not resolve "${mod}": ';

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Module} baseModule
     * @param {string} moduleName
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function String(baseModule, moduleName, resolutionStrategy) {
        var info = extractInterceptionInfo(moduleName),
            resolutionData = resolutionStrategy(baseModule, info.moduleName);

        abortOnResolutionError((resolutionStrategy.abortBundle ? baseModule.bundle : baseModule).state, resolutionData.error, moduleName);

        return resolutionData.moduleName ? [resolutionData.moduleName + (info.type ? (info.type + info.data) : '')] : [];
    }

    /**
     * @memberof JARS~internals.Strategies.Type.String
     * @inner
     *
     * @param {JARS~internals.State} state
     * @param {string} error
     * @param {string} moduleName
     */
    function abortOnResolutionError(state, error, moduleName) {
        error && state.setAborted(MSG_DEFAULT_RESOLUTION_ERROR + error, {
            mod: moduleName
        });
    }

    return String;
});
