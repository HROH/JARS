JARS.internal('hooks/Main', function mainHookSetup(InternalsManager) {
    'use strict';

    var SourceManager = InternalsManager.get('SourceManager'),
        Main;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} mainScript
     *
     * @return {string}
     */
    Main = function(globalConfig, mainScript) {
        return globalConfig.get('main') || (mainScript && SourceManager.loadSource('main', mainScript + '.js'));
    };

    return Main;
});
