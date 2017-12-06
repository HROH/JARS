JARS.internal('DependenciesResolver', function dependenciesResolverSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('ModulesRegistry'),
        AnyResolutionStrategy = getInternal('TypeStrategies/Any'),
        DependenciesResolutionStrategy = getInternal('ResolutionStrategies/Dependencies'),
        VersionResolver = getInternal('VersionResolver'),
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
        removeParentName: VersionResolver.unwrapVersion(function removeParentName(moduleName) {
            return moduleName.substr(moduleName.lastIndexOf(DOT) + 1);
        }),
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getParentName: VersionResolver.unwrapVersion(function getParentName(moduleName) {
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
