JARS.internal('hooks/Debugging', function debuggingHookSetup(InternalsManager) {
    'use strict';

    var System = InternalsManager.get('System'),
        Debugging;

    /**
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
