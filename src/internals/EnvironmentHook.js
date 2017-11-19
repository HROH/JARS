JARS.internal('EnvironmentHook', function() {
    'use strict';

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} environment
     *
     * @return {string}
     */
    var EnvironmentHook = function(globalConfig, environment) {
        if (environment !== globalConfig.get('environment')) {
            globalConfig.update(globalConfig.get('environments')[environment]);
        }

        return environment;
    };

    return EnvironmentHook;
});
