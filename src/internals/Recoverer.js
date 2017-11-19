JARS.internal('Recoverer', function recovererSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge,
        nextRecoverConfigs = {},
        MSG_RECOVERING = 'failed to load and tries to recover...',
        Recoverer;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    Recoverer = {
        /**
         * @param {JARS.internals.Module} module
         *
         * @return {boolean}
         */
        recover: function(module) {
            var updatedNextRecover = updateNextRecover(module.name, module.config);

            if (updatedNextRecover) {
                module.logger.warn(MSG_RECOVERING);
                module.load();
            }

            return updatedNextRecover;
        }
    };

    /**
     * @memberof JARS.internals.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS.internals.Config} config
     *
     * @return {boolean}
     */
    function updateNextRecover(moduleName, config) {
        var currentRecoverConfig = getCurrentRecoverConfig(moduleName, config),
            nextRecover;

        if(currentRecoverConfig) {
            setNextRecoverConfig(moduleName, currentRecoverConfig);
            nextRecover = currentRecoverConfig.get('recover');

            nextRecover && config.update(objectMerge({}, nextRecover, {
                restrict: moduleName
            }));
        }

        return !!nextRecover;
    }

    /**
     * @memberof JARS.internals.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS.internals.Config} fallbackConfig
     *
     * @return {(JARS.internals.Config|boolean)}
     */
    function getCurrentRecoverConfig(moduleName, fallbackConfig) {
        return nextRecoverConfigs[moduleName] === false ? false : nextRecoverConfigs[moduleName] || (nextRecoverConfigs[moduleName] = fallbackConfig);
    }

    /**
     * @memberof JARS.internals.Recoverer
     * @inner
     *
     * @param {string} moduleName
     * @param {JARS.internals.Config} currentRecoverConfig
     */
    function setNextRecoverConfig(moduleName, currentRecoverConfig) {
        nextRecoverConfigs[moduleName] = currentRecoverConfig.parentConfig || false;
    }

    return Recoverer;
});
