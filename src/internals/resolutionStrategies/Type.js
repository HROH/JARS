JARS.internal('resolutionStrategies/Type', function typeResolutionStrategiesSetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        NestedResolutionStrategy = getInternal('resolutionStrategies/Nested'),
        Utils = getInternal('Utils'),
        objectEach = Utils.objectEach,
        arrayEach = Utils.arrayEach,
        TypeResolutionStrategies;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    TypeResolutionStrategies = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.Dependencies.Declaration|JARS.internals.Bundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        any: function(baseModule, modules, resolutionStrategy) {
            var typeResolutionStrategy = TypeResolutionStrategies[System.getType(modules)];

            return typeResolutionStrategy(baseModule, modules, resolutionStrategy);
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.Dependencies.Declaration[]|JARS.internals.Bundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        array: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            arrayEach(modules, function concatResolvedModules(nestedModules) {
                resolvedModules = resolvedModules.concat(TypeResolutionStrategies.any(baseModule, nestedModules, resolutionStrategy));
            });

            return resolvedModules;
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {Object<string, JARS.internals.Dependencies.Declaration>} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        object: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
                var tmpBaseModuleName = TypeResolutionStrategies.string(baseModule, moduleName, resolutionStrategy)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(TypeResolutionStrategies.any(ModulesRegistry.get(tmpBaseModuleName), nestedModules, NestedResolutionStrategy));
                }
            });

            return resolvedModules;
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        string: function(baseModule, moduleName, resolutionStrategy) {
            var resolvedModule = resolutionStrategy(baseModule, moduleName);

            return resolvedModule ? [resolvedModule] : [];
        },
        /**
         * @return {string[]}
         */
        undefined: function() {
            return [];
        }
    };

    /**
     * @callback JARS.internals.ResolutionStrategy
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */

    return TypeResolutionStrategies;
});
