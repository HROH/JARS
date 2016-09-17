JARS.internal('DependenciesResolver', function dependenciesResolverSetup(InternalsManager) {
    'use strict';

    var DOT = '.',
        ResolutionStrategies = InternalsManager.get('ResolutionStrategies'),
        VersionResolver = InternalsManager.get('VersionResolver'),
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
        getParentName: VersionResolver.unwrapVersion(function getParentName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf(DOT));
        }),
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {JARS.internals.ModuleDependencies.Declaration} modules
         *
         * @return {string[]}
         */
        resolveDeps: function(baseModule, modules) {
            return ResolutionStrategies.any(baseModule, modules, ResolutionStrategies.deps);
        },
    };

    return DependenciesResolver;
});
