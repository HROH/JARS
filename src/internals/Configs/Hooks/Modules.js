JARS.internal('Configs/Hooks/Modules', function(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('Registries/Modules'),
        resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        each = getInternal('Helpers/Array').each;

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {JARS~internals.Configs.Hooks~Modules} config
     */
    function Modules(globalConfig, config) {
        var rootModule = ModulesRegistry.getRoot();

        if(config.restrict) {
            each(resolveDeps(rootModule, config.restrict), function updateConfig(moduleName) {
                var module = ModulesRegistry.get(moduleName);

                (isBundle(moduleName) ? module.bundle : module).config.update(config);
            });
        }
        else {
            rootModule.config.update(config);
        }
    }

    /**
     * @typedef {object} Modules
     *
     * @memberof JARS~internals.Configs.Hooks
     * @inner
     *
     * @property {string} basePath
     * @property {boolean} cache
     * @property {boolean} checkCircularDeps
     * @property {JARS~internals.Configs.Public} config
     * @property {string} context
     * @property {string} dirPath
     * @property {string} extension
     * @property {string} fileName
     * @property {boolean} minify
     * @property {JARS~internals.Configs.Hooks~Modules} recover
     * @property {number} timeout
     * @property {string} versionPath
     * @property {JARS~internals.Dependencies~Declaration} restrict
     */

    return Modules;
});
