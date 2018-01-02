JARS.internal('Handlers/BundleSubmodule', function(getInternal) {
    'use strict';

    var RequestHandler = getInternal('Handlers/Request'),
        BundleRef = getInternal('Refs/Bundle'),
        MSG_STRINGS = ['submodule', 'submodules'];

    /**
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Bundle} bundle
     *
     * @return {JARS.internals.RequestHandler}
     */
    function BundleSubmoduleHandler(bundle) {
        return new RequestHandler(bundle, bundle.modules, MSG_STRINGS, function(bundleRefs) {
            if(!bundle.state.isLoaded()) {
                bundle.ref = new BundleRef(bundle, bundleRefs);
                bundle.state.setLoaded();
            }
        });
    }

    return BundleSubmoduleHandler;
});
