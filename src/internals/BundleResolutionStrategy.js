JARS.internal('BundleResolutionStrategy', function bundleResolutionStrategySetup(getInternal) {
    'use strict';

    var logResolutionError = getInternal('ResolutionHelpers').logResolutionError,
        AbsoluteResolutionStrategy = getInternal('AbsoluteResolutionStrategy'),
        MSG_BUNDLE_RESOLUTION_ERROR = 'a bundle modulename must not start with a "."';

    /**
     * @method
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    var BundleResolutionStrategy = logResolutionError(AbsoluteResolutionStrategy, function getBundleLogger(baseModule) {
        return baseModule.bundle.logger;
    }, MSG_BUNDLE_RESOLUTION_ERROR);

    return BundleResolutionStrategy;
});
