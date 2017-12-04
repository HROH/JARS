JARS.internal('GlobalConfigHooks/Debugging', function debuggingHookSetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        Debugging;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {(Object|boolean)} debugConfig
     */
    Debugging = function(globalConfig, debugConfig) {
        if (!System.isObject(debugConfig)) {
            debugConfig = {
                debug: debugConfig
            };
        }

        globalConfig.update('modules', {
            config: debugConfig
        });
    };

    return Debugging;
});
