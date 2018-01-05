JARS.internal('Strategies/Resolution/Relative', function relativeResolutionStrategySetup(getInternal) {
    'use strict';

    var RelativeResolver = getInternal('Resolvers/Relative'),
        AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute');

    /**
     * @method Relative
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function RelativeResolutionStrategy(baseModule, moduleName) {
        return ((!baseModule.isRoot && RelativeResolver(moduleName)) ?
            RelativeResolutionStrategy(baseModule.deps.parent, moduleName.substr(1)) :
            AbsoluteResolutionStrategy(baseModule, moduleName));
    }

    return RelativeResolutionStrategy;
});
