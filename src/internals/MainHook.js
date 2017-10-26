JARS.internal('MainHook', function(InternalsManager) {
    'use strict';

    var SourceManager = InternalsManager.get('SourceManager'),
        MainHook;
        
    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} mainScript
     *
     * @return {string}
     */
    MainHook = function(globalConfig, mainScript) {
        return globalConfig.get('main') || (mainScript && SourceManager.loadSource('main', mainScript + '.js'));
    };

    return MainHook;
});
