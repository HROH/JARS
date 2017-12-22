JARS.internal('ResolutionStrategies/Relative', function relativeResolutionStrategySetup(getInternal) {
    'use strict';

    var isRelative = getInternal('Resolvers/Relative').isRelative,
        AbsoluteResolutionStrategy = getInternal('ResolutionStrategies/Absolute');

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
        return ((!baseModule.isRoot && isRelative(moduleName)) ?
            RelativeResolutionStrategy(baseModule.deps.parent, moduleName.substr(1)) :
            AbsoluteResolutionStrategy(baseModule, moduleName));
    }

    return RelativeResolutionStrategy;
});
