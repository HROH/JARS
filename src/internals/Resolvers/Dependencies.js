JARS.internal('Resolvers/Dependencies', function dependenciesResolverSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('Registries/Modules'),
        AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        DependenciesResolutionStrategy = getInternal('Strategies/Resolution/Dependencies'),
        unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        DOT = '.',
        DependenciesResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    DependenciesResolver = {
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getParentName: unwrapVersion(function getParentName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf(DOT));
        }),
        /**
         * @param {JARS.internals.Module} module
         *
         * @return {(JARS.internals.Module|null)}
         */
        getParent: function(module) {
            var parentName = DependenciesResolver.getParentName(module.name);

            return module.isRoot ? null : (parentName ? ModulesRegistry.get(parentName) : ModulesRegistry.getRoot());
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {JARS.internals.Dependencies.Declaration} modules
         *
         * @return {string[]}
         */
        resolveDeps: function(baseModule, modules) {
            return AnyResolutionStrategy(baseModule, modules, DependenciesResolutionStrategy);
        },
    };

    return DependenciesResolver;
});
