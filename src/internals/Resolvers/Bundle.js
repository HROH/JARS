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
         * @param {string} subjectName
         *
         * @return {string}
         */
        getBundleName: unwrapVersion(function getBundleName(subjectName) {
            return subjectName + BUNDLE_SUFFIX;
        }),
        /**
         * @method
         *
         * @param {string} subjectName
         *
         * @return {string}
         */
        removeBundleSuffix: unwrapVersion(function(subjectName) {
            return subjectName.replace(RE_BUNDLE_SUFFIX, EMPTY_STRING);
        })
    };

    Bundle.ROOT = Bundle.getBundleName(ParentResolver.ROOT);

    return Bundle;
});
