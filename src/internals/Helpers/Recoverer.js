JARS.internal('Helpers/Recoverer', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge,
        nextRecoverConfigs = {},
        MSG_RECOVERING = 'failed to load and tries to recover...';

    /**
     * @memberof JARS~internals.Helpers
     *
     * @param {JARS~internals.Subjects.Module} module
     *
     * @return {boolean}
     */
    function Recoverer(module) {
        var updatedNextRecover = updateNextRecover(module.name, module.config);

        if (updatedNextRecover) {
            module.logger.warn(MSG_RECOVERING);
            module.load();
        }

        return updatedNextRecover;
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
        var currentRecoverConfig = getCurrentRecoverConfig(moduleName, config),
            nextRecover;

        if(currentRecoverConfig) {
            setNextRecoverConfig(moduleName, currentRecoverConfig);
            nextRecover = currentRecoverConfig.get('recover');

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
    function getCurrentRecoverConfig(moduleName, fallbackConfig) {
        return nextRecoverConfigs[moduleName] === false ? false : nextRecoverConfigs[moduleName] || (nextRecoverConfigs[moduleName] = fallbackConfig);
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS~internals.Configs.Subject} currentRecoverConfig
     */
    function setNextRecoverConfig(moduleName, currentRecoverConfig) {
        nextRecoverConfigs[moduleName] = currentRecoverConfig.parentConfig || false;
    }

    return Recoverer;
});
