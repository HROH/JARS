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
        MSG_BUNDLE_DEFINED = 'defined submodules "${bundle}"',
        MSG_BUNDLE_NOT_DEFINED = 'there are no submodules defined';

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
        bundle.logger = new Logger(bundleName);
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
                bundleState = bundle.state,
                logger = bundle.logger;

            if(bundleState.setLoading()) {
                new ModulesQueue(bundle, [bundle._module.name]).request(function onModulesLoaded() {
                    var bundleModules = bundle._bundle;

                    if(bundleState.setRegistered()) {
                        if(bundleModules.length) {
                            logger.debug(MSG_BUNDLE_DEFINED, {
                                bundle: bundleModules.join(SEPARATOR)
                            });
                        }
                        else {
                            logger.warn(MSG_BUNDLE_NOT_DEFINED);
                        }

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
