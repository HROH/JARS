JARS.internal('NestedResolutionStrategy', function nestedResolutionStrategySetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        logResolutionError = getInternal('ResolutionHelpers').logResolutionError,
        resolveAbsolute = getInternal('AbsoluteResolutionStrategy'),
        DOT = '.',
        MSG_NESTED_RESOLUTION_ERROR = 'a nested modulename must contain "." only as a special symbol',
        NestedResolutionStrategy;

    /**
     * @method
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    NestedResolutionStrategy = logResolutionError(function resolveNested(baseModule, moduleName) {
        if(!baseModule.isRoot && moduleName === DOT) {
            moduleName = baseModule.name;
            baseModule = null;
        }

        return resolveAbsolute(baseModule, moduleName);
    }, function getLogger(baseModule) {
        return baseModule.logger;
    }, MSG_NESTED_RESOLUTION_ERROR);

    return NestedResolutionStrategy;
});
