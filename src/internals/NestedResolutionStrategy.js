JARS.internal('NestedResolutionStrategy', function nestedResolutionStrategySetup(InternalsManager) {
    'use strict';

    var ResolutionHelpers = InternalsManager.get('ResolutionHelpers'),
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
        resolve: ResolutionHelpers.logResolutionError(function resolveNested(baseModule, moduleName) {
            if(!baseModule.isRoot && moduleName === DOT) {
                moduleName = baseModule.name;
                baseModule = null;
            }

            return ResolutionHelpers.resolveAbsolute(baseModule, moduleName);
        }, function getLogger(baseModule) {
            return baseModule.logger;
        }, MSG_NESTED_RESOLUTION_ERROR)
    };

    return NestedResolutionStrategy;
});
