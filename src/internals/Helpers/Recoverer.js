JARS.internal('Helpers/Recoverer', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge,
        nextRecoverConfigs = {},
        MSG_RECOVERING = 'failed to load and tries to recover...';

    /**
     * @memberof JARS~internals.Helpers
     *
     * @param {JARS~internals.Module} module
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
     * @param {JARS~internals.Config} config
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
     * @param {JARS~internals.Config} fallbackConfig
     *
     * @return {(JARS~internals.Config|boolean)}
     */
    function getCurrentRecoverConfig(moduleName, fallbackConfig) {
        return nextRecoverConfigs[moduleName] === false ? false : nextRecoverConfigs[moduleName] || (nextRecoverConfigs[moduleName] = fallbackConfig);
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS~internals.Config} currentRecoverConfig
     */
    function setNextRecoverConfig(moduleName, currentRecoverConfig) {
        nextRecoverConfigs[moduleName] = currentRecoverConfig.parentConfig || false;
    }

    return Recoverer;
});
