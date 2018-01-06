JARS.internal('Strategies/Resolution/Bundle', function bundleResolutionStrategySetup(getInternal) {
    'use strict';

    var AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute'),
        RelativeResolver = getInternal('Resolvers/Relative'),
        MSG_BUNDLE_RESOLUTION_ERROR = 'a bundle module is already relative to the base module by default';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function Bundle(baseModule, moduleName) {
        return RelativeResolver(moduleName) ? {
            error: MSG_BUNDLE_RESOLUTION_ERROR
        } : AbsoluteResolutionStrategy(baseModule, moduleName);
    }

    Bundle.abortBundle = true;

    return Bundle;
});
