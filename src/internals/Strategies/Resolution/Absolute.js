JARS.internal('Strategies/Resolution/Absolute', function absoluteResolutionStrategySetup(getInternal) {
    'use strict';

    var VersionResolutionStrategy = getInternal('Strategies/Resolution/Version'),
        RelativeResolver = getInternal('Resolvers/Relative'),
        MSG_ABSOLUTE_RESOLUTION_ERROR = 'a module can not be resolved beyond the root';

    /**
     * @method Absolute
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function AbsoluteResolutionStrategy(baseModule, moduleName) {
        return (baseModule.isRoot || RelativeResolver(moduleName)) ? {
            error: MSG_ABSOLUTE_RESOLUTION_ERROR
        } : VersionResolutionStrategy(baseModule, moduleName);
    }

    return AbsoluteResolutionStrategy;
});
