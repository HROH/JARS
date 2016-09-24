JARS.internal('BundleResolutionStrategy', function(InternalsManager) {
    'use strict';

    var makeAbsolute = InternalsManager.get('ResolutionHelpers').makeAbsolute,
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
        resolve: function(baseModule, moduleName) {
            return makeAbsolute(baseModule, moduleName, MSG_BUNDLE_RESOLUTION_ERROR);
        }
    };

    return BundleResolutionStrategy;
});
