JARS.internal('Resolvers/Bundle', function(getInternal) {
    'use strict';

    var ArrayResolutionStrategy = getInternal('Strategies/Type/Array'),
        BundleResolutionStrategy = getInternal('Strategies/Resolution/Bundle'),
        VersionResolver = getInternal('Resolvers/Version'),
        unwrapVersion = VersionResolver.unwrapVersion,
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        RE_BUNDLE_SUFFIX = /\.\*$/,
        Bundle;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Bundle = {
        /**
         * @method
         *
         * @param {string} moduleName
         *
         * @return {string}
         */
        getBundleName: unwrapVersion(function getBundleName(moduleName) {
            return moduleName + BUNDLE_SUFFIX;
        }),
        /**
         * @method
         *
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeBundleSuffix: unwrapVersion(function(moduleName) {
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
         * @param {JARS~internals.Subjects.Module} baseModule
         * @param {JARS~internals.Subjects.Bundle~Declaration} bundleModules
         *
         * @return {string[]}
         */
        resolveBundle: function(baseModule, bundleModules) {
            return ArrayResolutionStrategy(baseModule, bundleModules || [], BundleResolutionStrategy);
        }
    };

    return Bundle;
});
