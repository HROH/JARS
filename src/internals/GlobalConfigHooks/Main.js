JARS.internal('GlobalConfigHooks/Main', function mainHookSetup(getInternal) {
    'use strict';

    var MAIN_CONTEXT = 'Main:',
        SUCCESS_MESSAGE = 'successfully loaded',
        ERROR_MESSAGE = 'aborted';

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} mainModule
     *
     * @return {string}
     */
    function Main(globalConfig, mainModule) {
        var Loader = getInternal('Loader');

        Loader.$import('System.*', function(System) {
            var mainLogger = new System.Logger(MAIN_CONTEXT + mainModule, {
                debug: true
            });

            globalConfig.update('modules', {
                restrict: mainModule,

                basePath: './',

                dirPath: ''
            });

            Loader.$import(mainModule, function mainModuleLoaded() {
                mainLogger.info(SUCCESS_MESSAGE);
            }, function mainModuleAborted() {
                mainLogger.error(ERROR_MESSAGE);
            });
        });

        return mainModule;
    }

    return Main;
});
