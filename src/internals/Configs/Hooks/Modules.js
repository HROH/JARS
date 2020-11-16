JARS.internal('Configs/Hooks/Modules', function(getInternal) {
    'use strict';

    var Injector = getInternal('Registries/Injector'),
        each = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {JARS~internals.Configs.Hooks~Modules} config
     */
    function Modules(globalConfig, config) {
        if(config.restrict) {
            each(Injector.getRootModule().dependencies.resolve(config.restrict), function updateConfig(subject) {
                subject.config.update(config);
            });
        }
        else {
            Injector.getRootBundle().config.update(config);
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
     * @property {string} scope
     * @property {boolean} debug
     * @property {string} dirPath
     * @property {string} extension
     * @property {string} fileName
     * @property {boolean} minify
     * @property {JARS~internals.Configs.Hooks~Modules} recover
     * @property {number} timeout
     * @property {string} versionPath
     * @property {JARS~internals.Subjects~Declaration} restrict
     */

    return Modules;
});
