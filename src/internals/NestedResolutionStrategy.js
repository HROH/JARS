JARS.internal('NestedResolutionStrategy', function(InternalsManager) {
    'use strict';

    var makeAbsolute = InternalsManager.get('ResolutionHelpers').makeAbsolute,
        DOT = '.',
        NestedResolutionStrategy;

    /**
     * @namespace
     * @implements JARS.internals.ResolutionStrategy
     *
     * @memberof JARS.internals
     */
    NestedResolutionStrategy = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        resolve: function(baseModule, moduleName) {
            return moduleName === DOT ? baseModule.name : makeAbsolute(baseModule, moduleName);
        },
        /**
         * @property {string}
         */
        errorMessage: 'a nested modulename must contain "." only as a special symbol'
    };

    return NestedResolutionStrategy;
});
