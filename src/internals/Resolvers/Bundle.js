JARS.internal('Resolvers/Bundle', function(getInternal) {
    'use strict';

    var ParentResolver = getInternal('Resolvers/Parent'),
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
        }
    };

    Bundle.ROOT = Bundle.getBundleName(ParentResolver.ROOT);

    return Bundle;
});
