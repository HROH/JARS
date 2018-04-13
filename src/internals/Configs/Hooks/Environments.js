JARS.internal('Configs/Hooks/Environments', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge;

    /**
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {JARS~internals.Configs.Hooks~Environments} environments
     *
     * @return {JARS~internals.Configs.Hooks~Environments}
     */
    function Environments(globalConfig, environments) {
        return merge(globalConfig.get('environments'), environments);
    }

    /**
     * @typedef {Object<string, JARS~internals.Configs.Global~Options>} Environments
     *
     * @memberof JARS~internals.Configs.Hooks
     * @inner
     */

    return Environments;
});
