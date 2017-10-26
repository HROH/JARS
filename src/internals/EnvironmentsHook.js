JARS.internal('EnvironmentsHook', function(InternalsManager) {
    'use strict';

    var objectMerge = InternalsManager.get('Utils').objectMerge,
        EnvironmentsHook;
        
    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {Object} environments
     *
     * @return {Object<string, Object>}
     */
    EnvironmentsHook = function(globalConfig, environments) {
        return objectMerge(globalConfig.get('environments'), environments);
    };

    return EnvironmentsHook;
});
