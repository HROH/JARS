JARS.internal('BundleResolutionStrategy', function(InternalsManager) {
    'use strict';

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
        resolve: InternalsManager.get('ResolutionHelpers').makeAbsolute,
        /**
         * @property {string}
         */
        errorMessage: 'a bundle modulename must not start with a "."'
    };

    return BundleResolutionStrategy;
});
