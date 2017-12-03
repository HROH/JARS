JARS.internal('hooks/Main', function mainHookSetup(getInternal) {
    'use strict';

    var MAIN_CONTEXT = 'Main:',
        EMPTY_PATH = '',
        SUCCESS_MESSAGE = 'successfully loaded',
        ERROR_MESSAGE = 'aborted',
        Main;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} mainScript
     *
     * @return {string}
     */
    Main = function(globalConfig, mainModule) {
        var Loader = getInternal('Loader');

        Loader.$import('System.*', function(System) {
            var mainLogger = new System.Logger(MAIN_CONTEXT + mainModule, {
                debug: true
            });

            JARS.configure('modules', {
                restrict: mainModule,

                basePath: EMPTY_PATH,

                dirPath: EMPTY_PATH
            });

            Loader.$import(mainModule, function mainModuleLoaded() {
                mainLogger.info(SUCCESS_MESSAGE);
            }, function mainModuleAborted() {
                mainLogger.error(ERROR_MESSAGE);
            });
        });

        return mainModule;
    };

    return Main;
});
