JARS.internal('Configs/Hooks/Debugging', function(getInternal) {
    'use strict';

    var isObject = getInternal('Types/Validators').isObject,
        merge = getInternal('Helpers/Object').merge;

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {(JARS~internals.Configs.Hooks~Debugging|boolean)} debugConfig
     */
    function Debugging(globalConfig, debugConfig) {
        debugConfig = merge({
            mode: 'console'
        }, isObject(debugConfig) ? debugConfig : {
            debug: debugConfig
        });

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
