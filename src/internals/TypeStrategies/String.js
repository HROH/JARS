JARS.internal('TypeStrategies/String', function(getInternal) {
    'use strict';

    var extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${mod}": ';

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
            
        logResolutionError((resolutionStrategy.logBundle ? baseModule.bundle : baseModule).logger, resolutionData.error, moduleName);

        return resolutionData.moduleName ? [resolutionData.moduleName + (info.type ? (info.type + info.data) : '')] : [];
    }

    function logResolutionError(logger, error, moduleName) {
        error && logger.error(MSG_DEFAULT_RESOLUTION_ERROR + error, {
            mod: moduleName
        });
    }

    return StringResolutionStrategy;
});
