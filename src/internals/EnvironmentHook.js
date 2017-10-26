JARS.internal('EnvironmentHook', function() {
    'use strict';

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} environment
     *
     * @return {string}
     */
    var EnvironmentHook = function(globalConfig, environment) {
        var environmentConfig = globalConfig.get('environments')[environment];

        if (environmentConfig !== globalConfig.get('environment')) {
            globalConfig.update(environmentConfig);
        }

        return environment;
    };

    return EnvironmentHook;
});
