JARS.internal('hooks/Environments', function environmentsHookSetup(InternalsManager) {
    'use strict';

    var objectMerge = InternalsManager.get('Utils').objectMerge,
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
