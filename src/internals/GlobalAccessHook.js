JARS.internal('GlobalAccessHook', function(InternalsManager) {
    'use strict';

    var ModulesRegistry = InternalsManager.get('ModulesRegistry'),
        GlobalAccessHook;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {boolean} makeGlobal
     *
     * @return {boolean}
     */
    GlobalAccessHook = function(globalConfig, makeGlobal) {
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

    return GlobalAccessHook;
});
