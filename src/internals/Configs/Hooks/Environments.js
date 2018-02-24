JARS.internal('Configs/Hooks/Environments', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge;

    /**
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {Object<string, JARS~internals.Configs.Global~Options>} environments
     *
     * @return {Object<string, JARS~internals.Configs.Global~Options>}
     */
    function Environments(globalConfig, environments) {
        return merge(globalConfig.get('environments'), environments);
    }

    return Environments;
});
