JARS.internal('Strategies/Resolution/Nested', function nestedResolutionStrategySetup(getInternal) {
    'use strict';

    var AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute'),
        DOT = '.',
        MSG_NESTED_RESOLUTION_ERROR = 'a nested module must contain "." only as a special symbol';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function Nested(baseModule, moduleName) {
        return moduleName !== DOT ? AbsoluteResolutionStrategy(baseModule, moduleName) : baseModule.isRoot ? {
            error: MSG_NESTED_RESOLUTION_ERROR
        } : {
            moduleName: baseModule.name
        };
    }

    return Nested;
});
