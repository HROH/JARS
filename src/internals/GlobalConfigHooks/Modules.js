JARS.internal('GlobalConfigHooks/Modules', function modulesHookSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = getInternal('Resolvers/Dependencies'),
        BundleResolver = getInternal('Resolvers/Bundle'),
        arrayEach = getInternal('Utils').arrayEach,
        Modules;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {Object} config
     */
    Modules = function(globalConfig, config) {
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

    return Modules;
});
