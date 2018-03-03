JARS.internal('Configs/Hooks/Debugging', function(getInternal) {
    'use strict';

    var isObject = getInternal('Types/Validators').isObject;

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {(JARS~internals.Configs.Hooks~Debugging|boolean)} debugConfig
     */
    function Debugging(globalConfig, debugConfig) {
        debugConfig = isObject(debugConfig) ? debugConfig : {
            debug: debugConfig
        };

        globalConfig.update('modules', {
            config: debugConfig,

            debug: debugConfig.debug
        });
    }

    /**
     * @typedef {Object} Debugging
     *
     * @memberof JARS~internals.Configs.Hooks
     * @inner
     *
     * @property {boolean} debug
     */

    return Debugging;
});
