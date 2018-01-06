JARS.internal('GlobalConfigHooks/Environment', function() {
    'use strict';

    /**
     * @method
     *
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {string} environment
     *
     * @return {string}
     */
    function Environment(globalConfig, environment) {
        if (environment !== globalConfig.get('environment')) {
            globalConfig.update(globalConfig.get('environments')[environment]);
        }

        return environment;
    }

    return Environment;
});
