JARS.internal('DebuggingHook', function(InternalsManager) {
    'use strict';

    var System = InternalsManager.get('System'),
        DebuggingHook;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {(Object|boolean)} debugConfig
     */
    DebuggingHook = function(globalConfig, debugConfig) {
        if (!System.isObject(debugConfig)) {
            debugConfig = {
                debug: debugConfig
            };
        }

        globalConfig.update('modules', {
            config: debugConfig
        });
    };

    return DebuggingHook;
});
