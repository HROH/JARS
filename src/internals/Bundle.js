JARS.internal('Bundle', function bundleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        BundleResolver = getInternal('BundleResolver'),
        LoaderQueue = getInternal('LoaderQueue'),
        Config = getInternal('Config'),
        Logger = getInternal('Logger'),
        State = getInternal('State'),
        SEPARATOR = '", "',
        MSG_BUNDLE_DEFINED = 'defined submodules "${bundle}"',
        MSG_BUNDLE_NOT_DEFINED = 'there are no submodules defined',
        // Errors when bundle is aborted
        MSG_BUNDLE_ABORTED = 'parent "${parent}"',
        MSG_BUNDLE_SUBMODULE_ABORTED = 'submodule "${subModule}"';

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
        bundle._state = new State(bundleName, bundle.logger);
        bundle._module = module;
    }

    Bundle.prototype = {
        constructor: Bundle,
        /**
         * @param {JARS.internals.Bundle.Declaration} bundleModules
         */
        add: function(bundleModules) {
            var bundle = this,
                resolvedBundle = BundleResolver.resolveBundle(bundle._module, bundleModules);

            resolvedBundle.length && bundle.logger.debug(MSG_BUNDLE_DEFINED, {
                bundle: resolvedBundle.join(SEPARATOR)
            });

            bundle._bundle = resolvedBundle;
        },
        /**
         * @param {JARS.internals.StateQueue.LoadedCallback} onBundleLoaded
         * @param {JARS.internals.StateQueue.AbortedCallback} onBundleAborted
         */
        request: function(onBundleLoaded, onBundleAborted) {
            var bundle = this,
                bundleState = bundle._state;

            if(bundleState.trySetRequested()) {
                new LoaderQueue(bundle, function onModulesLoaded() {
                    var bundleModules = bundle._bundle;

                    bundleModules.length || bundle.logger.warn(MSG_BUNDLE_NOT_DEFINED);

                    new LoaderQueue(bundle, function onModulesLoaded() {
                        if (!bundleState.isLoaded()) {
                            bundleState.setLoaded();
                        }
                    }).loadModules(bundleModules);
                }).loadModules([bundle._module.name]);
            }

            bundleState.onChange(onBundleLoaded, onBundleAborted);
        },
        /**
         * @param {string} parentOrSubModuleName
         */
        abort: function(parentOrSubModuleName) {
            var bundle = this,
                bundleState = bundle._state,
                isParent = bundle._module.name === parentOrSubModuleName;

            if (bundleState.isLoading()) {
                bundleState.setAborted(isParent ? MSG_BUNDLE_ABORTED : MSG_BUNDLE_SUBMODULE_ABORTED, isParent ? {
                    parent: parentOrSubModuleName
                } : {
                    subModule: parentOrSubModuleName
                });
            }
        }
    };

   /**
    * @typeDef {string[]} Declaration
    *
    * @memberof JARS.internals.Bundle
    */

    return Bundle;
});
