JARS.internal('ResolutionStrategies/Bundle', function bundleResolutionStrategySetup(getInternal) {
    'use strict';

    var logResolutionError = getInternal('ResolutionHelpers').logResolutionError,
        AbsoluteResolutionStrategy = getInternal('ResolutionStrategies/Absolute'),
        MSG_BUNDLE_RESOLUTION_ERROR = 'a bundle modulename must not start with a "."';

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
    var BundleResolutionStrategy = logResolutionError(AbsoluteResolutionStrategy, MSG_BUNDLE_RESOLUTION_ERROR, true);

    return BundleResolutionStrategy;
});
