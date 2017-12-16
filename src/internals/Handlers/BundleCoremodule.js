JARS.internal('Handlers/BundleCoremodule', function(getInternal) {
    'use strict';

    var RequestHandler = getInternal('Handlers/Request'),
        MSG_STRINGS = ['core module'];

    /**
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Bundle} bundle
     *
     * @return {JARS.internals.RequestHandler}
     */
    function BundleCoremoduleHandler(bundle) {
        return new RequestHandler(bundle, [bundle.module.name], MSG_STRINGS, function() {
            bundle.processor.register();
        });
    }

    return BundleCoremoduleHandler;
});
