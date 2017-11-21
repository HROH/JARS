JARS.internal('typeStrategies/Any', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        strategies = {};

    /**
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

    function getStrategy(type) {
        return strategies[type] || (strategies[type] = getInternal('typeStrategies/' + type.charAt(0).toUpperCase() + type.substr(1)));
    }

    return AnyResolutionStrategy;
});
