JARS.internal('ModulesHook', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        arrayEach = getInternal('Utils').arrayEach,
        ModulesHook;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {Object} config
     */
    ModulesHook = function(globalConfig, config) {
        var rootModule = ModulesRegistry.getRoot();

        if(config.restrict) {
            arrayEach(DependenciesResolver.resolveDeps(rootModule, config.restrict), function updateConfig(moduleName) {
                var module = ModulesRegistry.get(moduleName);

                (BundleResolver.isBundle(moduleName) ? module.bundle : module).config.update(config);
            });
        }
        else {
            rootModule.config.update(config);
        }
    };

    return ModulesHook;
});
