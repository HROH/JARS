JARS.internal('Strategies/Type/Any', function(getInternal) {
    'use strict';

    var getType = getInternal('System').getType;

    /**
     * @method Any
     *
     * @memberof JARS.internals.TypeStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {(JARS.internals.Dependencies.Declaration|JARS.internals.Bundle.Declaration)} modules
     * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function AnyResolutionStrategy(baseModule, modules, resolutionStrategy) {
        return getInternal('Strategies/Type')[getType(modules)](baseModule, modules, resolutionStrategy);
    }

    return AnyResolutionStrategy;
});
