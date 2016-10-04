JARS.internal('BundleResolutionStrategy', function bundleResolutionStrategySetup(InternalsManager) {
    'use strict';

    var ResolutionHelpers = InternalsManager.get('ResolutionHelpers'),
        MSG_BUNDLE_RESOLUTION_ERROR = 'a bundle modulename must not start with a "."';

    /**
     * @namespace
     * @implements JARS.internals.ResolutionStrategy
     *
     * @memberof JARS.internals
     */
    var BundleResolutionStrategy = {
        /**
         * @method
         *
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        resolve: ResolutionHelpers.logResolutionError(ResolutionHelpers.resolveAbsolute, function getBundleLogger(baseModule) {
            return baseModule.bundle.logger;
        }, MSG_BUNDLE_RESOLUTION_ERROR)
    };

    return BundleResolutionStrategy;
});
