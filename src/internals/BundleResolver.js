JARS.internal('BundleResolver', function bundleResolverSetup(getInternal) {
    'use strict';

    var resolveArray = getInternal('resolutionStrategies/Type').array,
        BundleResolutionStrategy = getInternal('resolutionStrategies/Bundle'),
        VersionResolver = getInternal('VersionResolver'),
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        RE_BUNDLE_SUFFIX = /\.\*$/,
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
        removeBundleSuffix: VersionResolver.unwrapVersion(function(moduleName) {
            return moduleName.replace(RE_BUNDLE_SUFFIX, EMPTY_STRING);
        }),
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isBundle: function(moduleName) {
            return RE_BUNDLE_SUFFIX.test(VersionResolver.removeVersion(moduleName));
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {JARS.internals.Bundle.Declaration} bundleModules
         *
         * @return {string[]}
         */
        resolveBundle: function(baseModule, bundleModules) {
            return resolveArray(baseModule, bundleModules || [], BundleResolutionStrategy);
        }
    };

    return BundleResolver;
});
