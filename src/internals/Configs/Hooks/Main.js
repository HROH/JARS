JARS.internal('Configs/Hooks/Main', function(getInternal) {
    'use strict';

    var Transports = getInternal('Logger/Transports'),
        Console = getInternal('Logger/Console'),
        Logger = getInternal('Logger/Logger'),
        LOG_ALL = getInternal('Logger/Levels').ALL,
        globalTransports = new Transports([new Console()]),
        MAIN_CONTEXT = 'Main:',
        REQUEST_MESSAGE = 'requested',
        SUCCESS_MESSAGE = 'successfully loaded',
        ERROR_MESSAGE = 'aborted';

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {string} mainModuleName
     *
     * @return {string}
     */
    function Main(globalConfig, mainModuleName) {
        var SubjectsRegistry = getInternal('Registries/Subjects'),
            anonymousModule = SubjectsRegistry.getAnonymousModule(),
            mainLogger = new Logger(MAIN_CONTEXT + mainModuleName, globalTransports, {
                debug: true,

                level: LOG_ALL
            });

        globalConfig.update('modules', {
            restrict: mainModuleName,

            basePath: getInternal('Env').BASE_PATH,

            dirPath: ''
        });

        mainLogger.debug(REQUEST_MESSAGE);

        anonymousModule.$import(mainModuleName);
        anonymousModule.$export(function() {
            mainLogger.debug(SUCCESS_MESSAGE);
        }, function(subjectName, percentage) {
            mainLogger.debug(subjectName, percentage);
        }, function() {
            mainLogger.error(ERROR_MESSAGE);
        });

        return mainModuleName;
    }

    return Main;
});
