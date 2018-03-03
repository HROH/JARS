JARS.internal('Configs/Hooks/Modules', function(getInternal) {
    'use strict';

    var SubjectsRegistry = getInternal('Registries/Subjects'),
        each = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {JARS~internals.Configs.Hooks~Modules} config
     */
    function Modules(globalConfig, config) {
        if(config.restrict) {
            each(SubjectsRegistry.getRootModule().dependencies.resolve(config.restrict), function updateConfig(subject) {
                subject.config.update(config);
            });
        }
        else {
            SubjectsRegistry.getRootBundle().config.update(config);
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
