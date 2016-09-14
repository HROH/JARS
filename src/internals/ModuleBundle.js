JARS.internal('ModuleBundle', function moduleBundleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Resolver = getInternal('Resolver'),
        LoaderQueue = getInternal('LoaderQueue'),
        ModuleQueue = getInternal('ModuleQueue'),
        ModuleConfig = getInternal('ModuleConfig'),
        ModuleLogger = getInternal('ModuleLogger'),
        ModuleState = getInternal('ModuleState'),
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
     * @param {string} moduleName
     * @param {JARS.internals.ModuleConfig} parentConfig
     */
    function ModuleBundle(moduleName, parentConfig) {
        var moduleBundle = this,
            moduleBundleName = Resolver.getBundleName(moduleName);

        moduleBundle.name = moduleBundleName;
        moduleBundle.config = new ModuleConfig(moduleBundle, parentConfig);
        moduleBundle.logger = new ModuleLogger(moduleBundleName);
        moduleBundle._state = new ModuleState(moduleBundle.logger);
        moduleBundle._queue = new ModuleQueue(moduleBundleName, moduleBundle._state);
        moduleBundle._moduleName = moduleName;
    }

    ModuleBundle.prototype = {
        constructor: ModuleBundle,
        /**
         * @param {JARS.internals.ModuleBundle.Declaration} bundle
         */
        add: function(bundle) {
            var moduleBundle = this,
                resolvedBundle = Resolver.resolveBundle(moduleBundle._moduleName, bundle);

            resolvedBundle.length && moduleBundle.logger.debug(MSG_BUNDLE_DEFINED, {
                bundle: resolvedBundle.join(SEPARATOR)
            });

            moduleBundle._bundle = resolvedBundle;
        },
        /**
         * @param {JARS.internals.ModuleQueue.SuccessCallback} onBundleLoaded
         * @param {JARS.internals.ModuleQueue.FailCallback} onBundleAborted
         */
        request: function(onBundleLoaded, onBundleAborted) {
            var moduleBundle = this,
                bundleQueue = moduleBundle._queue,
                bundleState = moduleBundle._state;

            if(bundleState.trySetRequested()) {
                new LoaderQueue(moduleBundle, function onModulesLoaded() {
                    var bundle = moduleBundle._bundle;

                    bundle.length || moduleBundle.logger.warn(MSG_BUNDLE_NOT_DEFINED);

                    new LoaderQueue(moduleBundle, function onModulesLoaded() {
                        if (!bundleState.isLoaded()) {
                            bundleState.setLoaded();
                            bundleQueue.notify();
                        }
                    }).loadModules(bundle);
                }).loadModules([moduleBundle._moduleName]);
            }

            bundleQueue.add(onBundleLoaded, onBundleAborted);
        },
        /**
         * @param {string} parentOrSubModuleName
         */
        abort: function(parentOrSubModuleName) {
            var moduleBundle = this,
                bundleState = moduleBundle._state,
                isParent = moduleBundle._moduleName === parentOrSubModuleName;

            if (bundleState.isLoading()) {
                bundleState.setAborted(isParent ? MSG_BUNDLE_ABORTED : MSG_BUNDLE_SUBMODULE_ABORTED, isParent ? {
                    parent: parentOrSubModuleName
                } : {
                    subModule: parentOrSubModuleName
                });

                moduleBundle._queue.notifyError();
            }
        }
    };

   /**
    * @typeDef {string[]} Declaration
    *
    * @memberof JARS.internals.ModuleBundle
    */

    return ModuleBundle;
});
