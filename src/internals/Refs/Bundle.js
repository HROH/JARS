JARS.internal('Refs/Bundle', function() {
    'use strict';

    /**
     * @class
     *
     * @memberof JARS~internals.Refs
     *
     * @param {JARS~internals.Subjects.Bundle} bundle
     * @param {JARS~internals.Refs.Modules} bundleRefs
     */
    function Bundle(bundle, bundleRefs) {
        this._ref = bundle.module.ref;
        this._refs = bundleRefs;
    }

    Bundle.prototype = {
        constructor: Bundle,
        /**
         * @param {string} [context]
         *
         * @return {*}
         */
        get: function(context) {
            this._refs.get(context);

            return this._ref.get(context);
        }
    };

    return Bundle;
});
