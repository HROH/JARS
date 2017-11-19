JARS.internal('hooks/GlobalAccess', function globalAccessHookSetup(InternalsManager) {
    'use strict';

    var ModulesRegistry = InternalsManager.get('ModulesRegistry'),
        GlobalAccess;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {boolean} makeGlobal
     *
     * @return {boolean}
     */
    GlobalAccess = function(globalConfig, makeGlobal) {
        if (makeGlobal) {
            JARS.mods = ModulesRegistry.getRoot().ref;
            JARS.internals = InternalsManager;
        }
        else {
            delete JARS.mods;
            delete JARS.internals;
        }

        return !!makeGlobal;
    };

    return GlobalAccess;
});
