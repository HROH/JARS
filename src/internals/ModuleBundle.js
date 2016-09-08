JARS.internal('ModuleBundle', function moduleBundleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Resolver = getInternal('Resolver'),
        LoaderQueue = getInternal('LoaderQueue'),
        ModuleQueue = getInternal('ModuleQueue'),
        SEPERATOR = '", "',
        MSG_BUNDLE_DEFINED = 'defined submodules "${bundle}"',
        MSG_BUNDLE_NOT_DEFINED = 'there are no submodules defined';

    function ModuleBundle(module) {
        this._module = module;
        this._queue = new ModuleQueue(module, true);
    }

    ModuleBundle.prototype = {
        constructor: ModuleBundle,

        add: function(bundle) {
            var moduleBundle = this,
                module = moduleBundle._module,
                resolvedBundle = Resolver.resolveBundle(bundle, module.name);

            resolvedBundle.length && module.logger.debug(MSG_BUNDLE_DEFINED, true, {
                bundle: resolvedBundle.join(SEPERATOR)
            });

            moduleBundle._bundle = resolvedBundle;
        },

        request: function(callback, errback) {
            var moduleBundle = this,
                bundleQueue = moduleBundle._queue,
                module = moduleBundle._module,
                state = module.state;

            if(state.trySetRequested(true)) {
                new LoaderQueue(module, true, function onModulesLoaded() {
                    var bundle = moduleBundle._bundle;

                    bundle.length || module.logger.warn(MSG_BUNDLE_NOT_DEFINED, true);

                    new LoaderQueue(module, true, function onModulesLoaded() {
                        if (!state.isLoaded(true)) {
                            state.setLoaded(true);
                            bundleQueue.notify();
                        }
                    }).loadModules(bundle);
                }).loadModules([module.name]);
            }

            bundleQueue.add(callback, errback);
        },

        abort: function(bundleDependency) {
            var moduleBundle = this,
                abortionInfo = {
                    dep: bundleDependency
                };

            if (moduleBundle._module.state.trySetAborted(true, abortionInfo)) {
                moduleBundle._queue.notifyError();
            }
        }
    };

    return ModuleBundle;
});
