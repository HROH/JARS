JARS.internal('typeStrategies/String', function() {
    'use strict';

    /**
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function StringResolutionStrategy(baseModule, moduleName, resolutionStrategy) {
        var resolvedModule = resolutionStrategy(baseModule, moduleName);

        return resolvedModule ? [resolvedModule] : [];
    }

    return StringResolutionStrategy;
});
