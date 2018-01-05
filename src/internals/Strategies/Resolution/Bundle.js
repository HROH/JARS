JARS.internal('Strategies/Resolution/Bundle', function bundleResolutionStrategySetup(getInternal) {
    'use strict';

    var AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute'),
        RelativeResolver = getInternal('Resolvers/Relative'),
        MSG_BUNDLE_RESOLUTION_ERROR = 'a bundle module is already relative to the base module by default';

    /**
     * @method Bundle
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function BundleResolutionStrategy(baseModule, moduleName) {
        return RelativeResolver(moduleName) ? {
            error: MSG_BUNDLE_RESOLUTION_ERROR
        } : AbsoluteResolutionStrategy(baseModule, moduleName);
    }

    BundleResolutionStrategy.abortBundle = true;

    return BundleResolutionStrategy;
});
