JARS.internal('ModuleBundle', function moduleBundleSetup(InternalsManager) {
    'use strict';

    var Resolver = InternalsManager.get('Resolver'),
        ModuleLogger = InternalsManager.get('ModuleLogger'),
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

        subscribe: function() {
            var moduleBundle = this,
                module = moduleBundle._module,
                bundle = moduleBundle._bundle;

            bundle.length || module.logger.log(MSG_BUNDLE_NOT_DEFINED);

            module.state.setLoading(true);

            module.subscribe(bundle, true);
        }
    };

    return ModuleBundle;
});
