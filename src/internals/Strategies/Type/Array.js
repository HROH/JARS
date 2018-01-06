JARS.internal('Strategies/Type/Array', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        AnyResolutionStrategy = getInternal('Strategies/Type/Any');

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Module} baseModule
     * @param {Array<(JARS~internals.Dependencies~Declaration|JARS~internals.Bundle~Declaration)>} modules
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function Array(baseModule, modules, resolutionStrategy) {
        var resolvedModules = [];

        each(modules, function concatResolvedModules(nestedModules) {
            resolvedModules = resolvedModules.concat(AnyResolutionStrategy(baseModule, nestedModules, resolutionStrategy));
        });

        return resolvedModules;
    }

    return Array;
});
