JARS.internal('GlobalConfigHooks/Environments', function environmentsHookSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge,
        Environments;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {Object} environments
     *
     * @return {Object<string, Object>}
     */
    Environments = function(globalConfig, environments) {
        return objectMerge(globalConfig.get('environments'), environments);
    };

    return Environments;
});
