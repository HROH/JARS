JARS.internal('ModuleBundle', function moduleBundleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Resolver = getInternal('Resolver'),
        LoaderQueue = getInternal('LoaderQueue'),
        SEPERATOR = '", "',
        MSG_BUNDLE_DEFINED = 'defined submodules "${bundle}"',
        MSG_BUNDLE_NOT_DEFINED = 'there are no submodules defined';

    function ModuleBundle(module) {
        this._module = module;
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

        request: function() {
            var moduleBundle = this,
                module = moduleBundle._module,
                state = module.state;

            new LoaderQueue(module, true, function onModulesLoaded() {
                var bundle = moduleBundle._bundle;

                bundle.length || module.logger.warn(MSG_BUNDLE_NOT_DEFINED, true);

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
