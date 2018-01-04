JARS.internal('GlobalConfigHooks/Modules', function modulesHookSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('Registries/Modules'),
        resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        arrayEach = getInternal('Utils').arrayEach;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {Object} config
     */
    function Modules(globalConfig, config) {
        var rootModule = ModulesRegistry.getRoot();

        if(config.restrict) {
            arrayEach(resolveDeps(rootModule, config.restrict), function updateConfig(moduleName) {
                var module = ModulesRegistry.get(moduleName);

                (isBundle(moduleName) ? module.bundle : module).config.update(config);
            });
        }
        else {
            rootModule.config.update(config);
        }
    }

    return Modules;
});
