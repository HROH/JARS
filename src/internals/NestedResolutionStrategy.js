JARS.internal('NestedResolutionStrategy', function(InternalsManager) {
    'use strict';

    var makeAbsolute = InternalsManager.get('ResolutionHelpers').makeAbsolute,
        DOT = '.',
        MSG_NESTED_RESOLUTION_ERROR = 'a nested modulename must contain "." only as a special symbol',
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
            if(!baseModule.isRoot && moduleName === DOT) {
                moduleName = baseModule.name;
                baseModule = null;
            }

            return makeAbsolute(baseModule, moduleName, MSG_NESTED_RESOLUTION_ERROR);
        }
    };

    return NestedResolutionStrategy;
});
