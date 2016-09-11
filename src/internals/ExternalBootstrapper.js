JARS.internal('ExternalBootstrapper', function externalBootstrapperSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('utils').arrayEach,
        Loader = getInternal('Loader'),
        ConfigsManager = getInternal('ConfigsManager'),
        JARS_MAIN_LOGCONTEXT = 'JARS:main',
        moduleNamesQueue = [],
        mainReadyQueue = [],
        mainLogger, ExternalBootstrapper;

    Loader.$import('System.*', function setupMainLogger(System) {
        mainLogger = new System.Logger(JARS_MAIN_LOGCONTEXT);

        arrayEach(mainReadyQueue, function bootstrapMainFromQueue(queueData) {
            bootstrapMain(System, queueData[0], queueData[1], queueData[2]);
        });

        mainReadyQueue = null;
    });

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ExternalBootstrapper = {
        /**
         * @param {JARS.ModuleDependencies.Declaration} modules
         */
        $import: function(modules) {
            moduleNamesQueue = moduleNamesQueue.concat(modules);
        },
        /**
         * @param {function(...*)} main
         * @param {JARS.ModuleQueue.FailCallback} [onAbort]
         */
        main: function(main, onAbort) {
            var moduleNames = moduleNamesQueue;

            moduleNamesQueue = [];

            if(!mainLogger) {
                mainReadyQueue.push([moduleNames, main, onAbort]);
            }
            else {
                bootstrapMain(getInternal('System'), moduleNames, main, onAbort);
            }
        }
    };

    /**
     * @private
     *
     * @memberof JARS.internals.ExternalBootstrapper
     *
     * @param {System} System
     * @param {JARS.ModuleDependencies.Declaration} modules
     * @param {function(...*)} main
     * @param {JARS.ModuleQueue.FailCallback} [onAbort]
     */
    function bootstrapMain(System, moduleNames, main, onAbort) {
        if (System.isFunction(main)) {
            if (moduleNames.length) {
                Loader.$import(moduleNames, onImport, System.isFunction(onAbort) ? onAbort : defaultOnAbort);
            }
            else {
                onImport();
            }
        }
        else {
            mainLogger.error('No main function provided');
        }

        function onImport() {
            var root = Loader.getRoot();

            if (ConfigsManager.get('supressErrors')) {
                try {
                    mainLogger.log('Start executing main...');
                    main.apply(root, arguments);
                }
                catch (e) {
                    mainLogger.error((e.stack || e.message || '\n\tError in JavaScript-code: ' + e) + '\nexiting...');
                }
                finally {
                    mainLogger.log('...done executing main');
                }
            }
            else {
                main.apply(root, arguments);
            }
        }
    }

    /**
     * @private
     *
     * @memberof JARS.internals.ExternalBootstrapper
     *
     * @type {JARS.ModuleQueue.FailCallback}
     */
    function defaultOnAbort(abortedModuleName) {
        mainLogger.error('Import of "${0}" failed!', [abortedModuleName]);
    }

    return ExternalBootstrapper;
});
