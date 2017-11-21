JARS.internal('typeStrategies/Object', function(getInternal) {
    'use strict';

    var objectEach = getInternal('Utils').objectEach,
        AnyResolutionStrategy = getInternal('typeStrategies/Any'),
        StringResolutionStrategy = getInternal('typeStrategies/String'),
        NestedResolutionStrategy = getInternal('resolutionStrategies/Nested'),
        ModulesRegistry = getInternal('ModulesRegistry');

    /**
     * @param {JARS.internals.Module} baseModule
     * @param {Object<string, JARS.internals.Dependencies.Declaration>} modules
     * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function ObjectResolutionStrategy(baseModule, modules, resolutionStrategy) {
        var resolvedModules = [];

        objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
            var tmpBaseModuleName = StringResolutionStrategy(baseModule, moduleName, resolutionStrategy)[0];

            if(tmpBaseModuleName) {
                resolvedModules = resolvedModules.concat(AnyResolutionStrategy(ModulesRegistry.get(tmpBaseModuleName), nestedModules, NestedResolutionStrategy));
            }
        });

        return resolvedModules;
    }

    return ObjectResolutionStrategy;
});
