JARS.internal('GlobalConfigHooks/Environment', function environmentHookSetup() {
    'use strict';

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} environment
     *
     * @return {string}
     */
    var Environment = function(globalConfig, environment) {
        if (environment !== globalConfig.get('environment')) {
            globalConfig.update(globalConfig.get('environments')[environment]);
        }

        return environment;
    };

    return Environment;
});
