JARS.internal('ResolutionStrategies/Nested', function nestedResolutionStrategySetup(getInternal) {
    'use strict';

    var logResolutionError = getInternal('ResolutionHelpers').logResolutionError,
        resolveAbsolute = getInternal('ResolutionStrategies/Absolute'),
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
    }, MSG_NESTED_RESOLUTION_ERROR);

    return NestedResolutionStrategy;
});