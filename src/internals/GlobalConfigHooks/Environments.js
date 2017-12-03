JARS.internal('GlobalConfigHooks/Environments', function environmentsHookSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge,
        Environments;

    /**
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
