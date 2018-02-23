JARS.internal('Resolvers/Dependencies', function(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('Registries/Modules'),
        AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        DependenciesResolutionStrategy = getInternal('Strategies/Resolution/Dependencies'),
        unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        DOT = '.',
        Dependencies;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Dependencies = {
        /**
         * @method
         *
         * @param {string} moduleName
         *
         * @return {string}
         */
        getParentName: unwrapVersion(function getParentName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf(DOT));
        }),
        /**
         * @param {JARS~internals.Subjects.Module} module
         *
         * @return {(JARS~internals.Subjects.Module|null)}
         */
        getParent: function(module) {
            var parentName = Dependencies.getParentName(module.name);

            return module.isRoot ? null : (parentName ? ModulesRegistry.get(parentName) : ModulesRegistry.getRoot());
        },
        /**
         * @param {JARS~internals.Subjects.Module} baseModule
         * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} modules
         *
         * @return {string[]}
         */
        resolveDeps: function(baseModule, modules) {
            return AnyResolutionStrategy(baseModule, modules, DependenciesResolutionStrategy);
        },
    };

    return Dependencies;
});
