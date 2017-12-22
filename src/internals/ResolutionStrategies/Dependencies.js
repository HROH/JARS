JARS.internal('ResolutionStrategies/Dependencies', function dependenciesResolutionStrategySetup(getInternal) {
    'use strict';

    var isRelative = getInternal('Resolvers/Relative').isRelative,
        logResolutionError = getInternal('ResolutionHelpers').logResolutionError,
        AbsoluteResolutionStrategy = getInternal('ResolutionStrategies/Absolute'),
        RelativeResolutionStrategy = getInternal('ResolutionStrategies/Relative'),
        MSG_DEPENDENCY_RESOLUTION_ERROR = 'a dependency modulename must be absolute or relative to the current module',
        DependenciesResolutionStrategy;

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
    DependenciesResolutionStrategy = logResolutionError(function resolveDependency(baseModule, moduleName) {
        return isRelative(moduleName) ? RelativeResolutionStrategy(baseModule, moduleName) : AbsoluteResolutionStrategy(null, moduleName);
    }, MSG_DEPENDENCY_RESOLUTION_ERROR);

    return DependenciesResolutionStrategy;
});
