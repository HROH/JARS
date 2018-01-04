JARS.internal('GlobalConfigHooks/Environments', function environmentsHookSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge;

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
    function Environments(globalConfig, environments) {
        return objectMerge(globalConfig.get('environments'), environments);
    }

    return Environments;
});
