JARS.internal('Strategies/Type/Object', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Object').each,
        AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        StringResolutionStrategy = getInternal('Strategies/Type/String'),
        NestedResolutionStrategy = getInternal('Strategies/Resolution/Nested'),
        ModulesRegistry = getInternal('Registries/Modules');

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Subjects.Module} baseModule
     * @param {Object<string, JARS~internals.Subjects.Dependencies.Module~Declaration>} modules
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function Object(baseModule, modules, resolutionStrategy) {
        var resolvedModules = [];

        each(modules, function concatResolvedModules(nestedModules, moduleName) {
            var tmpBaseModuleName = StringResolutionStrategy(baseModule, moduleName, resolutionStrategy)[0];

            if(tmpBaseModuleName) {
                resolvedModules = resolvedModules.concat(AnyResolutionStrategy(ModulesRegistry.get(tmpBaseModuleName), nestedModules, NestedResolutionStrategy));
            }
        });

        return resolvedModules;
    }

    return Object;
});
