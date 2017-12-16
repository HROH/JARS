JARS.internal('Processors/Bundle', function(getInternal) {
    'use strict';

    var BundleCoremoduleHandler = getInternal('Handlers/BundleCoremodule'),
        BundleSubmoduleHandler = getInternal('Handlers/BundleSubmodule'),
        ModulesQueue = getInternal('ModulesQueue'),
        DEFAULT_BUNDLE_LOG_INFO = {
            bundle: 'none',

            log: 'warn'
        },
        SEPARATOR = '", "',
        MSG_BUNDLE_DEFINED = ' - with submodules "${bundle}"';

    function BundleProcessor(bundle) {
        this.bundle = bundle;
    }

    BundleProcessor.prototype = {
        constructor: BundleProcessor,

        load: function() {
            var bundle = this.bundle;

            if(bundle.state.setLoading()) {
                ModulesQueue.request(BundleCoremoduleHandler(bundle));
            }
        },

        register: function() {
            var bundle = this.bundle;

            if(bundle.state.setRegistered(MSG_BUNDLE_DEFINED, getBundleLogInfo(bundle.modules))) {
                ModulesQueue.request(BundleSubmoduleHandler(bundle));
            }
        }
    };

    function getBundleLogInfo(bundleModules) {
        return bundleModules.length ? {
            bundle: bundleModules.join(SEPARATOR),

            log: 'debug'
        } : DEFAULT_BUNDLE_LOG_INFO;
    }

    return BundleProcessor;
});