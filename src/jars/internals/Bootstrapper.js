JARS.internal('Bootstrapper', function bootstrapperSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Loader = getInternal('Loader'),
        ConfigsManager = getInternal('ConfigsManager'),
        JARS_MAIN_LOGCONTEXT = 'JARS:main',
        mainLogger, Bootstrapper;

    Bootstrapper = {
        bootstrapInternals: function(internalsPath) {
            var SourceManager = getInternal('SourceManager'),
                System = getInternal('System'),
                InterceptionManager = getInternal('InterceptionManager'),
                basePath = SourceManager.getBasePath(),
                systemModule;

            InterceptionManager.addInterceptor(getInternal('PluginInterceptor'));

            InterceptionManager.addInterceptor(getInternal('PartialModuleInterceptor'));

            Loader.registerModule(getInternal('Resolver').getRootName()).$export();

            systemModule = Loader.registerModule('System', ['Logger', 'Modules']);

            systemModule.$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough
                return System;
            });

            ConfigsManager.update({
                modules: [{
                    basePath: basePath,

                    cache: true,

                    minified: false,

                    timeout: 5
                }, {
                    restrict: 'System.*',

                    basePath: basePath + internalsPath
                }]
            });

            systemModule.request(true);
        },

        bootstrapMain: function(moduleNames, main, onAbort) {
            // TODO when mainLogger is defined skip this Loader.$import call
            Loader.$import('System.*', function setupMainLogger(System) {
                mainLogger = mainLogger || new System.Logger(JARS_MAIN_LOGCONTEXT);

                bootstrapMain(System, moduleNames, main, onAbort);
            });
        }
    };

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

    function defaultOnAbort(abortedModuleName) {
        mainLogger.error('Import of "${0}" failed!', [abortedModuleName]);
    }

    return Bootstrapper;
});
