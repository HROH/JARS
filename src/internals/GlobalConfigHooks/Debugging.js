JARS.internal('GlobalConfigHooks/Debugging', function(getInternal) {
    'use strict';

    var isObject = getInternal('System').isObject;

    /**
     * @method
     *
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {(JARS~internals.GlobalConfig~Options.Debugging|boolean)} debugConfig
     */
    function Debugging(globalConfig, debugConfig) {
        globalConfig.update('modules', {
            config: isObject(debugConfig) ? debugConfig : {
                debug: debugConfig
            }
        });
    }

    /**
     * @typedef {Object} Debugging
     *
     * @memberof JARS~internals.GlobalConfig~Options
     *
     * @property {boolean} debug
     */

    return Debugging;
});
