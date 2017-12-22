JARS.internal('GlobalConfigHooks/GlobalAccess', function globalAccessHookSetup(getInternal) {
    'use strict';

    var getRootModule = getInternal('ModulesRegistry').getRoot,
        GlobalAccess;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {boolean} makeGlobal
     *
     * @return {boolean}
     */
    GlobalAccess = function(globalConfig, makeGlobal) {
        if (makeGlobal) {
            JARS.mods = getRootModule().ref;
            JARS.internals = getInternal('InternalsManager');
        }
        else {
            delete JARS.mods;
            delete JARS.internals;
        }

        return !!makeGlobal;
    };

    return GlobalAccess;
});
