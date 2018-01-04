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

    function BundleProcessor(bundle) {
        this.bundle = bundle;
    }

    BundleProcessor.prototype = {
        constructor: BundleProcessor,

        load: function() {
            if(this.bundle.state.setLoading()) {
                Modules.request(BundleCoremoduleHandler(this.bundle));
            }
        },

        register: function() {
            if(this.bundle.state.setRegistered(MSG_BUNDLE_DEFINED, getBundleLogInfo(this.bundle.modules))) {
                Modules.request(BundleSubmoduleHandler(this.bundle));
            }
        }
    };

    function getBundleLogInfo(bundleModules) {
        return bundleModules.length ? {
            bundle: bundleModules.join(SEPARATOR),

            done: 'debug'
        } : DEFAULT_BUNDLE_LOG_INFO;
    }

    return BundleProcessor;
});
