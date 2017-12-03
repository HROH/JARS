JARS.internal('ResolutionStrategies/Dependencies', function dependenciesResolutionStrategySetup(getInternal) {
    'use strict';

    var ResolutionHelpers = getInternal('ResolutionHelpers'),
        AbsoluteResolutionStrategy = getInternal('ResolutionStrategies/Absolute'),
        RelativeResolutionStrategy = getInternal('ResolutionStrategies/Relative'),
        MSG_DEPENDENCY_RESOLUTION_ERROR = 'a dependency modulename must be absolute or relative to the current module',
        DependenciesResolutionStrategy;

    /**
     * @method
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    DependenciesResolutionStrategy = ResolutionHelpers.logResolutionError(function resolveDependency(baseModule, moduleName) {
        return ResolutionHelpers.isRelative(moduleName) ? RelativeResolutionStrategy(baseModule, moduleName) : AbsoluteResolutionStrategy(null, moduleName);
    }, function getLogger(baseModule) {
        return baseModule.logger;
    }, MSG_DEPENDENCY_RESOLUTION_ERROR);

    return DependenciesResolutionStrategy;
});
