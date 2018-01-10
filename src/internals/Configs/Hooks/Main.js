JARS.internal('Configs/Hooks/Main', function(getInternal) {
    'use strict';

    var MAIN_CONTEXT = 'Main:',
        SUCCESS_MESSAGE = 'successfully loaded',
        ERROR_MESSAGE = 'aborted';

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {string} mainModule
     *
     * @return {string}
     */
    function Main(globalConfig, mainModule) {
        var $import = getInternal('Handlers/Modules').$import;

        $import('System.*', function(System) {
            var mainLogger = new System.Logger(MAIN_CONTEXT + mainModule, {
                debug: true
            });

            globalConfig.update('modules', {
                restrict: mainModule,

                basePath: './',

                dirPath: ''
            });

            $import(mainModule, function mainModuleLoaded() {
                mainLogger.info(SUCCESS_MESSAGE);
            }, function mainModuleAborted() {
                mainLogger.error(ERROR_MESSAGE);
            });
        });

        return mainModule;
    }

    return Main;
});
