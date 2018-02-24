JARS.internal('Processors/Bundle', function(getInternal) {
    'use strict';

    var BundleCoremoduleHandler = getInternal('Handlers/BundleCoremodule'),
        BundleSubmoduleHandler = getInternal('Handlers/BundleSubmodule'),
        Modules = getInternal('Handlers/Modules'),
        DEFAULT_BUNDLE_LOG_INFO = {
            bundle: 'none',

            done: 'warn'
        },
        SEPARATOR = '", "',
        MSG_BUNDLE_DEFINED = ' - with submodules "${bundle}"';

    /**
     * @class
     *
     * @memberof JARS~internals.Processors
     *
     * @param {JARS~internals.Subjects.Bundle}
     */
    function Bundle(bundle) {
        this.bundle = bundle;
    }

    Bundle.prototype = {
        constructor: Bundle,
        /**
         * @method
         */
        load: function() {
            if(this.bundle.state.setLoading()) {
                Modules.request(BundleCoremoduleHandler(this.bundle));
            }
        },
        /**
         * @method
         */
        register: function() {
            if(this.bundle.state.setRegistered(MSG_BUNDLE_DEFINED, getBundleLogInfo(this.bundle.modules))) {
                Modules.request(BundleSubmoduleHandler(this.bundle));
            }
        }
    };

    /**
     * @memberof JARS~internals.Processors.Bundle
     * @inner
     *
     * @param {string[]} bundleModules
     *
     * @return {Object}
     */
    function getBundleLogInfo(bundleModules) {
        return bundleModules.length ? {
            bundle: bundleModules.join(SEPARATOR),

            done: 'debug'
        } : DEFAULT_BUNDLE_LOG_INFO;
    }

    return Bundle;
});
