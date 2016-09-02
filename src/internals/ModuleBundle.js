JARS.internal('ModuleBundle', function moduleBundleSetup(InternalsManager) {
    'use strict';

    var Resolver = InternalsManager.get('Resolver'),
        ModuleLogger = InternalsManager.get('ModuleLogger'),
        LoaderQueue = InternalsManager.get('LoaderQueue'),
        SEPERATOR = '", "',
        MSG_BUNDLE_DEFINED = ModuleLogger.addDebug('defined submodules "${bundle}" for bundle', true),
        MSG_BUNDLE_NOT_DEFINED = ModuleLogger.addWarning('there are no submodules defined for this bundle', true);

    function ModuleBundle(module) {
        this._module = module;
    }

    ModuleBundle.prototype = {
        constructor: ModuleBundle,

        add: function(bundle) {
            var moduleBundle = this,
                module = moduleBundle._module,
                resolvedBundle = Resolver.resolveBundle(bundle, module.name);

            resolvedBundle.length && module.logger.log(MSG_BUNDLE_DEFINED, {
                bundle: resolvedBundle.join(SEPERATOR)
            });

            moduleBundle._bundle = resolvedBundle;
        },

        request: function() {
            var moduleBundle = this,
                module = moduleBundle._module,
                state = module.state;

            new LoaderQueue(module, true, function onModulesLoaded() {
                var bundle = moduleBundle._bundle;

                bundle.length || module.logger.log(MSG_BUNDLE_NOT_DEFINED);

                state.setLoading(true);

                new LoaderQueue(module, true, function onModulesLoaded() {
                    if (!state.isLoaded(true)) {
                        state.setLoaded(true);
                        module.queue.notify(true);
                    }
                }).loadModules(bundle);
            }).loadModules([module.name]);
        }
    };

    return ModuleBundle;
});
