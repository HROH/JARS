JARS.internal('Configs/Hooks/Main', function(getInternal) {
    'use strict';

    var Transports = getInternal('Logger/Transports'),
        Console = getInternal('Logger/Console'),
        Logger = getInternal('Logger/Logger'),
        LOG_ALL = getInternal('Logger/Levels').ALL,
        globalTransports = new Transports([new Console()]),
        MAIN_CONTEXT = 'Main:',
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
        var $import = getInternal('Handlers/Import').$import,
            mainLogger = new Logger(MAIN_CONTEXT + mainModule, globalTransports, {
                debug: true,

                level: LOG_ALL
            });

        globalConfig.update('modules', {
            restrict: mainModule,

            basePath: getInternal('Env').BASE_PATH,

            dirPath: ''
        });

        $import(mainModule, function mainModuleLoaded() {
            mainLogger.info(SUCCESS_MESSAGE);
        }, function mainModuleAborted() {
            mainLogger.error(ERROR_MESSAGE);
        });

        return mainModule;
    }

    return Main;
});
