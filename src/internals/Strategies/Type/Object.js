JARS.internal('Strategies/Type/Object', function(getInternal) {
    'use strict';

    var objectEach = getInternal('Utils').objectEach,
        AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        StringResolutionStrategy = getInternal('Strategies/Type/String'),
        NestedResolutionStrategy = getInternal('Strategies/Resolution/Nested'),
        ModulesRegistry = getInternal('Registries/Modules');

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Module} baseModule
     * @param {Object<string, JARS~internals.Dependencies~Declaration>} modules
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function Object(baseModule, modules, resolutionStrategy) {
        var resolvedModules = [];

        objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
            var tmpBaseModuleName = StringResolutionStrategy(baseModule, moduleName, resolutionStrategy)[0];

            if(tmpBaseModuleName) {
                resolvedModules = resolvedModules.concat(AnyResolutionStrategy(ModulesRegistry.get(tmpBaseModuleName), nestedModules, NestedResolutionStrategy));
            }
        });

        return resolvedModules;
    }

    return Object;
});
