JARS.internal('GlobalConfigHooks/Debugging', function debuggingHookSetup(getInternal) {
    'use strict';

    var isObject = getInternal('System').isObject;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {(Object|boolean)} debugConfig
     */
    function Debugging(globalConfig, debugConfig) {
        globalConfig.update('modules', {
            config: isObject(debugConfig) ? debugConfig : {
                debug: debugConfig
            }
        });
    }

    return Debugging;
});
