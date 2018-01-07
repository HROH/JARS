JARS.internal('Configs/Hooks/Environment', function() {
    'use strict';

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
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
