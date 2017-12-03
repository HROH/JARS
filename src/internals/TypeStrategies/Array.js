JARS.internal('TypeStrategies/Array', function(getInternal) {
    'use strict';

    var arrayEach = getInternal('Utils').arrayEach,
        AnyResolutionStrategy = getInternal('TypeStrategies/Any');

    /**
     * @param {JARS.internals.Module} baseModule
     * @param {(JARS.internals.Dependencies.Declaration[]|JARS.internals.Bundle.Declaration)} modules
     * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function ArrayResolutionStrategy(baseModule, modules, resolutionStrategy) {
        var resolvedModules = [];

        arrayEach(modules, function concatResolvedModules(nestedModules) {
            resolvedModules = resolvedModules.concat(AnyResolutionStrategy(baseModule, nestedModules, resolutionStrategy));
        });

        return resolvedModules;
    }

    return ArrayResolutionStrategy;
});
