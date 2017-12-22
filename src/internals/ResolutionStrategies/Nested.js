JARS.internal('ResolutionStrategies/Nested', function nestedResolutionStrategySetup(getInternal) {
    'use strict';

    var logResolutionError = getInternal('ResolutionHelpers').logResolutionError,
        AbsoluteResolutionStrategy = getInternal('ResolutionStrategies/Absolute'),
        DOT = '.',
        MSG_NESTED_RESOLUTION_ERROR = 'a nested modulename must contain "." only as a special symbol',
        NestedResolutionStrategy;

    /**
     * @method Nested
     *
     * @memberof JARS.internals.ResolutionStrategies
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

        return moduleName !== DOT ? AbsoluteResolutionStrategy(baseModule, moduleName) : baseModule.isRoot ? {
            error: MSG_NESTED_RESOLUTION_ERROR
        } : {
            moduleName: baseModule.name
        };
    });

    return NestedResolutionStrategy;
});
