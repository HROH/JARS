JARS.internal('GlobalConfigHooks/Modules', function(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('Registries/Modules'),
        resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        arrayEach = getInternal('Utils').arrayEach;

    /**
     * @method
     *
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {JARS~internals.GlobalConfig~Options.Modules} config
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

    /**
     * @typedef {object} Modules
     *
     * @memberof JARS~internals.GlobalConfig~Options
     *
     * @property {string} basePath
     * @property {boolean} cache
     * @property {boolean} checkCircularDeps
     * @property {object} config
     * @property {string} context
     * @property {string} dirPath
     * @property {string} extension
     * @property {string} fileName
     * @property {boolean} minify
     * @property {JARS~internals.GlobalConfig~Options.Modules} recover
     * @property {number} timeout
     * @property {string} versionPath
     * @property {JARS~internals.Dependencies~Declaration} restrict
     */

    return Modules;
});
