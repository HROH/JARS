JARS.internal('Bundle', function bundleSetup(getInternal) {
    'use strict';

    var BundleResolver = getInternal('Resolvers/Bundle'),
        Tools = getInternal('Tools');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} module
     */
    function Bundle(module) {
        var bundle = this;

        bundle.name = BundleResolver.getBundleName(module.name);
        bundle.modules = [];
        bundle.module = module;

        Tools.addToBundle(bundle);
    }

    Bundle.prototype = {
        constructor: Bundle,
        /**
         * @param {JARS.internals.Bundle.Declaration} bundleModules
         */
        add: function(bundleModules) {
            this.modules = BundleResolver.resolveBundle(this.module, bundleModules);
        },

        find: function(bundleModule) {
            var index = this.modules.indexOf(BundleResolver.resolveBundle(this.module, [bundleModule])[0]);

            return index > -1 ? this.modules[index] : null;
        }
    };

   /**
    * @typeDef {string[]} Declaration
    *
    * @memberof JARS.internals.Bundle
    */

    return Bundle;
});
