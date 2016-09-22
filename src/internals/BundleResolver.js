JARS.internal('BundleResolver', function bundleResolverSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        resolveArray = getInternal('ResolutionStrategies').array,
        BundleResolutionStrategy = getInternal('BundleResolutionStrategy'),
        VersionResolver = getInternal('VersionResolver'),
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        RE_BUNDLE = /\.\*$/,
        BundleResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    BundleResolver = {
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getBundleName: VersionResolver.unwrapVersion(function getBundleName(moduleName) {
            return moduleName + BUNDLE_SUFFIX;
        }),
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeBundle: VersionResolver.unwrapVersion(function(moduleName) {
            return moduleName.replace(RE_BUNDLE, EMPTY_STRING);
        }),
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isBundle: function(moduleName) {
            return RE_BUNDLE.test(VersionResolver.removeVersion(moduleName));
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {JARS.internals.ModuleBundle.Declaration} bundleModules
         *
         * @return {string[]}
         */
        resolveBundle: function(baseModule, bundleModules) {
            return resolveArray(baseModule, bundleModules || [], BundleResolutionStrategy);
        }
    };

    return BundleResolver;
});
