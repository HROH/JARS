JARS.internal('Bundle', function(getInternal) {
    'use strict';

    var BundleResolver = getInternal('Resolvers/Bundle'),
        SubjectHelper = getInternal('Helpers/Subject');

    /**
     * @class
     *
     * @memberof JARS~internals
     *
     * @param {JARS~internals.Module} module
     */
    function Bundle(module) {
        var bundle = this;

        bundle.name = BundleResolver.getBundleName(module.name);
        bundle.modules = [];
        bundle.module = module;

        SubjectHelper.addToBundle(bundle);
    }

    Bundle.prototype = {
        constructor: Bundle,
        /**
         * @param {JARS~internals.Bundle~Declaration} bundleModules
         */
        add: function(bundleModules) {
            this.modules = BundleResolver.resolveBundle(this.module, bundleModules);
        },
        /**
         * @param {string} bundleModule
         *
         * @return {(string|null)}
         */
        find: function(bundleModule) {
            var index = this.modules.indexOf(BundleResolver.resolveBundle(this.module, [bundleModule])[0]);

            return index > -1 ? this.modules[index] : null;
        }
    };

   /**
    * @typedef {string[]} Declaration
    *
    * @memberof JARS~internals.Bundle
    * @inner
    */

    return Bundle;
});
