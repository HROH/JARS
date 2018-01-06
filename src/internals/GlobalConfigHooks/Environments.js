JARS.internal('GlobalConfigHooks/Environments', function(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge;

    /**
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {Object<string, JARS~internals.GlobalConfig~Options>} environments
     *
     * @return {Object<string, JARS~internals.GlobalConfig~Options>}
     */
    function Environments(globalConfig, environments) {
        return objectMerge(globalConfig.get('environments'), environments);
    }

    return Environments;
});
