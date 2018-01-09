JARS.internal('Strategies/Resolution/Dependencies', function dependenciesResolutionStrategySetup(getInternal) {
    'use strict';

    var RelativeResolver = getInternal('Resolvers/Relative'),
        RelativeResolutionStrategy = getInternal('Strategies/Resolution/Relative'),
        MSG_DEPENDENCY_RESOLUTION_ERROR = 'a dependency module must be absolute or relative to the base module';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function Dependencies(baseModule, moduleName) {
        return RelativeResolver(moduleName) ? RelativeResolutionStrategy(baseModule, moduleName) : moduleName ? {
            moduleName: moduleName
        } : {
            error: MSG_DEPENDENCY_RESOLUTION_ERROR
        };
    }

    return Dependencies;
});
