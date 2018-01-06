JARS.internal('GlobalConfigHooks/GlobalAccess', function(getInternal) {
    'use strict';

    var getRootModule = getInternal('Registries/Modules').getRoot;

    /**
     * @method
     *
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {boolean} makeGlobal
     *
     * @return {boolean}
     */
    function GlobalAccess(globalConfig, makeGlobal) {
        if (makeGlobal) {
            JARS.mods = getRootModule().ref.get();
            JARS.internals = getInternal('Registries/Internals');
        }
        else {
            delete JARS.mods;
            delete JARS.internals;
        }

        return !!makeGlobal;
    }

    return GlobalAccess;
});
