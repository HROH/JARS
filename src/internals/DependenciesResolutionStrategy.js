JARS.internal('DependenciesResolutionStrategy', function(InternalsManager) {
    'use strict';

    var ResolutionHelpers = InternalsManager.get('ResolutionHelpers'),
        DependenciesResolutionStrategy;

    /**
     * @namespace
     * @implements JARS.internals.ResolutionStrategy
     *
     * @memberof JARS.internals
     */
    DependenciesResolutionStrategy = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        resolve: function(baseModule, moduleName) {
            return ((!baseModule.isRoot && ResolutionHelpers.isRelative(moduleName)) ?
                DependenciesResolutionStrategy.resolve(baseModule.deps.parent, moduleName.substr(1)) :
                ResolutionHelpers.makeAbsolute(baseModule, moduleName));
        },
        /**
         * @property {string}
         */
        errorMessage: 'a dependency modulename must be absolute or relative to the current module'
    };

    return DependenciesResolutionStrategy;
});
