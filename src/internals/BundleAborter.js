JARS.internal('BundleAborter', function bundleAborterSetup() {
    'use strict';

    var MSG_ABORTED_BY_BUNDLE_PARENT = ' - missing parent "${0}"',
        MSG_ABORTED_BY_BUNDLE_SUBMODULE = ' - missing submodule "${0}"',
        BundleAborter;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    BundleAborter = {
        /**
         * @param {JARS.internals.Bundle} bundle
         * @param {string} subModuleName
         */
        abortBySubModule: function(bundle, subModuleName) {
            bundle.state.setAborted(MSG_ABORTED_BY_BUNDLE_SUBMODULE, [subModuleName]);
        },
        /**
         * @param {JARS.internals.Bundle} bundle
         * @param {string} parentModuleName
         */
        abortByParent: function(bundle, parentModuleName) {
            bundle.state.setAborted(MSG_ABORTED_BY_BUNDLE_PARENT, [parentModuleName]);
        }
    };

    return BundleAborter;
});
