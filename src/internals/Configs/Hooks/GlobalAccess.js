JARS.internal('Configs/Hooks/GlobalAccess', function(getInternal) {
    'use strict';

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {boolean} makeGlobal
     *
     * @return {boolean}
     */
    function GlobalAccess(globalConfig, makeGlobal) {
        if (makeGlobal) {
            JARS.internals = getInternal('Registries/Internals');
        }
        else {
            delete JARS.internals;
        }

        return !!makeGlobal;
    }

    return GlobalAccess;
});
