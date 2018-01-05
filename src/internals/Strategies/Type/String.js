JARS.internal('Strategies/Type/String', function(getInternal) {
    'use strict';

    var extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
        MSG_DEFAULT_RESOLUTION_ERROR = ' - could not resolve "${mod}": ';

    /**
     * @method String
     *
     * @memberof JARS.internals.TypeStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function StringResolutionStrategy(baseModule, moduleName, resolutionStrategy) {
        var info = extractInterceptionInfo(moduleName),
            resolutionData = resolutionStrategy(baseModule, info.moduleName);

        abortOnResolutionError((resolutionStrategy.abortBundle ? baseModule.bundle : baseModule).state, resolutionData.error, moduleName);

        return resolutionData.moduleName ? [resolutionData.moduleName + (info.type ? (info.type + info.data) : '')] : [];
    }

    function abortOnResolutionError(state, error, moduleName) {
        error && state.setAborted(MSG_DEFAULT_RESOLUTION_ERROR + error, {
            mod: moduleName
        });
    }

    return StringResolutionStrategy;
});
