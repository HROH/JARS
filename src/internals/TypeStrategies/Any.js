JARS.internal('TypeStrategies/Any', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        strategies = {};

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
        var typeResolutionStrategy = getStrategy(System.getType(modules));

        return typeResolutionStrategy(baseModule, modules, resolutionStrategy);
    }

    /**
     * @memberof JARS.internals.TypeStrategies.Any
     * @inner
     *
     * @param {string} type
     *
     * @return {function}
     */
    function getStrategy(type) {
        return strategies[type] || (strategies[type] = getInternal('TypeStrategies')[type]);
    }

    return AnyResolutionStrategy;
});
