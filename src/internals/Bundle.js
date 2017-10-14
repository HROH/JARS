JARS.internal('Bundle', function bundleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        BundleAborter = getInternal('BundleAborter'),
        BundleResolver = getInternal('BundleResolver'),
        ModulesQueue = getInternal('ModulesQueue'),
        Config = getInternal('Config'),
        Logger = getInternal('Logger'),
        State = getInternal('State'),
        SEPARATOR = '", "',
        LOG_CONTEXT_PREFIX = 'Bundle:',
        MSG_BUNDLE_DEFINED = ' - with submodules "${bundle}"',
        DEFAULT_REQUEST_INFO = {
            bundle: 'none',

            log: 'warn'
        };

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} module
     * @param {JARS.internals.Config} parentConfig
     */
    function Bundle(module, parentConfig) {
        var bundle = this,
            bundleName = BundleResolver.getBundleName(module.name);

        bundle.name = bundleName;
        bundle.config = new Config(bundle, parentConfig);
        bundle.logger = new Logger(LOG_CONTEXT_PREFIX + bundleName);
        bundle.state = new State(bundleName, bundle.logger);
        bundle._module = module;
    }

    Bundle.prototype = {
        constructor: Bundle,
        /**
         * @param {JARS.internals.Bundle.Declaration} bundleModules
         */
        add: function(bundleModules) {
            var bundle = this;

            bundle._bundle = BundleResolver.resolveBundle(bundle._module, bundleModules);
        },
        /**
         * @param {JARS.internals.State.LoadedCallback} onBundleLoaded
         * @param {JARS.internals.State.AbortedCallback} onBundleAborted
         */
        request: function(onBundleLoaded, onBundleAborted) {
            var bundle = this,
                bundleState = bundle.state;

            if(bundleState.setLoading()) {
                new ModulesQueue(bundle, [bundle._module.name]).request(function onModulesLoaded() {
                    var bundleModules = bundle._bundle,
                        requestInfo = bundleModules.length ? {
                            bundle: bundleModules.join(SEPARATOR),

                            log: 'debug'
                        } : DEFAULT_REQUEST_INFO;

                    if(bundleState.setRegistered(MSG_BUNDLE_DEFINED, requestInfo)) {
                        new ModulesQueue(bundle, bundleModules).request(function onModulesLoaded() {
                            bundleState.setLoaded();
                        }, BundleAborter.abortBySubModule);
                    }
                }, BundleAborter.abortByParent);
            }

            bundleState.onChange(onBundleLoaded, onBundleAborted);
        }
    };

   /**
    * @typeDef {string[]} Declaration
    *
    * @memberof JARS.internals.Bundle
    */

    return Bundle;
});
