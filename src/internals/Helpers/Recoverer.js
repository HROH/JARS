JARS.internal('Helpers/Recoverer', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge,
        nextConfigs = {},
        MSG_RECOVERING = 'failed to load and tries to recover...';

    /**
     * @memberof JARS~internals.Helpers
     *
     * @param {JARS~internals.Subjects.Subject} module
     *
     * @return {boolean}
     */
    function Recoverer(module) {
        var updated = updateNextRecover(module.name, module.config);

        if (updated) {
            module.logger.warn(MSG_RECOVERING);
            module.handler(module);
        }

        return updated;
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS~internals.Configs.Subject} config
     *
     * @return {boolean}
     */
    function updateNextRecover(moduleName, config) {
        var currentConfig = getCurrentConfig(moduleName, config),
            nextRecover;

        if(currentConfig) {
            setNextConfig(moduleName, currentConfig);
            nextRecover = currentConfig.get('recover');

            nextRecover && config.update(merge({}, nextRecover, {
                restrict: moduleName
            }));
        }

        return !!nextRecover;
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS~internals.Configs.Subject} fallbackConfig
     *
     * @return {(JARS~internals.Configs.Subject|boolean)}
     */
    function getCurrentConfig(moduleName, fallbackConfig) {
        return nextConfigs[moduleName] === false ? false : nextConfigs[moduleName] || (nextConfigs[moduleName] = fallbackConfig);
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS~internals.Configs.Subject} currentConfig
     */
    function setNextConfig(moduleName, currentConfig) {
        nextConfigs[moduleName] = currentConfig.parentConfig || false;
    }

    return Recoverer;
});
