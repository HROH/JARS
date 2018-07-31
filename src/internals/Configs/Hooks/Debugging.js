JARS.internal('Configs/Hooks/Debugging', function(getInternal) {
    'use strict';

    var isObject = getInternal('Types/Validators').isObject,
        merge = getInternal('Helpers/Object').merge,
        LOG_ALL = getInternal('Logger/Levels').ALL;

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {(JARS~internals.Configs.Hooks~Debugging|boolean)} debugConfig
     *
     * @return {JARS~internals.Configs.Hooks~Debugging}
     */
    function Debugging(globalConfig, debugConfig) {
        debugConfig = merge({
            level: LOG_ALL
        }, isObject(debugConfig) ? debugConfig : {
            debug: debugConfig
        });

        globalConfig.update('modules', {
            config: debugConfig
        });

        return debugConfig;
    }

    /**
     * @typedef {Object} Debugging
     *
     * @memberof JARS~internals.Configs.Hooks
     * @inner
     *
     * @property {boolean} debug
     * @property {string} [level]
     */

    return Debugging;
});
