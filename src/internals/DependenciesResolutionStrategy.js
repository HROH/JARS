JARS.internal('DependenciesResolutionStrategy', function dependenciesResolutionStrategySetup(InternalsManager) {
    'use strict';

    var ResolutionHelpers = InternalsManager.get('ResolutionHelpers'),
        isRelative = ResolutionHelpers.isRelative,
        makeAbsolute = ResolutionHelpers.makeAbsolute,
        MSG_DEPENDENCY_RESOLUTION_ERROR = 'a dependency modulename must be absolute or relative to the current module',
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
            return isRelative(moduleName) ? resolveRelative(baseModule, moduleName) : makeAbsolute(null, moduleName, MSG_DEPENDENCY_RESOLUTION_ERROR);
        }
    };

    function resolveRelative(baseModule, moduleName) {
        return ((!baseModule.isRoot && isRelative(moduleName)) ?
            resolveRelative(baseModule.deps.parent, moduleName.substr(1)) :
            makeAbsolute(baseModule, moduleName, MSG_DEPENDENCY_RESOLUTION_ERROR));
    }

    return DependenciesResolutionStrategy;
});
