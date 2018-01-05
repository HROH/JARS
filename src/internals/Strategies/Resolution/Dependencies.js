JARS.internal('Strategies/Resolution/Dependencies', function dependenciesResolutionStrategySetup(getInternal) {
    'use strict';

    var RelativeResolver = getInternal('Resolvers/Relative'),
        RelativeResolutionStrategy = getInternal('Strategies/Resolution/Relative'),
        MSG_DEPENDENCY_RESOLUTION_ERROR = 'a dependency module must be absolute or relative to the base module';

    /**
     * @method Dependencies
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function DependenciesResolutionStrategy(baseModule, moduleName) {
        return RelativeResolver(moduleName) ? RelativeResolutionStrategy(baseModule, moduleName) : moduleName ? {
            moduleName: moduleName
        } : {
            error: MSG_DEPENDENCY_RESOLUTION_ERROR
        };
    }

    return DependenciesResolutionStrategy;
});
