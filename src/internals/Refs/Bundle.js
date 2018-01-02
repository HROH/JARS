JARS.internal('Refs/Bundle', function() {
    'use strict';

    function BundleRef(bundle, bundleRefs) {
        this._ref = bundle.module.ref;
        this._refs = bundleRefs;
    }

    BundleRef.prototype = {
        constructor: BundleRef,

        get: function(context) {
            this._refs.get(context);

            return this._ref.get(context);
        }
    };

    return BundleRef;
});
