JARS.internal('LoaderQueue', function(InternalsManager) {
    'use strict';

    var arrayEach = InternalsManager.get('utils').arrayEach,
        Resolver = InternalsManager.get('Resolver'),
        InterceptionManager = InternalsManager.get('InterceptionManager'),
        ModuleLogger = InternalsManager.get('ModuleLogger'),
        SEPERATOR = '", "',
        MODULE = 'module ',
        BUNDLE = 'bundle ',
        SUBSCRIBED_TO = 'subscribed to "${subs}"',
        NOTIFIED_BY = 'was notified by "${pub}"',
        MSG_MODULE_NOTIFIED = ModuleLogger.addDebug(MODULE + NOTIFIED_BY),
        MSG_MODULE_SUBSCRIBED = ModuleLogger.addDebug(MODULE + SUBSCRIBED_TO),
        MSG_BUNDLE_NOTIFIED = ModuleLogger.addDebug(BUNDLE + NOTIFIED_BY, true),
        MSG_BUNDLE_SUBSCRIBED = ModuleLogger.addDebug(BUNDLE + SUBSCRIBED_TO, true);

    function LoaderQueue(module, isBundleQueue, onModulesLoaded, onModuleLoaded, onModuleAborted) {
        this._module = module;
        this._isBundleQueue = isBundleQueue;
        this._counter = 0;
        this._total = 0;
        this._onModulesLoaded = onModulesLoaded;
        this._onModuleLoaded = onModuleLoaded || function onModuleLoaded() {};
        this._onModuleAborted = onModuleAborted || function onModuleAborted(abortedModuleName) {
            module.isRoot() || module.abort(isBundleQueue, abortedModuleName);
        };
    }

    LoaderQueue.prototype = {
        constructor: LoaderQueue,

        loadModules: function(moduleNames) {
            var loaderQueue = this,
                module = loaderQueue._module,
                logger = module.logger,
                isBundleQueue = loaderQueue._isBundleQueue,
                modulesToLoad = moduleNames.length;

            if(modulesToLoad) {
                logger.log(isBundleQueue ? MSG_BUNDLE_SUBSCRIBED : MSG_MODULE_SUBSCRIBED, {
                    subs: moduleNames.join(SEPERATOR)
                });

                loaderQueue._total += modulesToLoad;

                arrayEach(moduleNames, function loadModule(moduleName) {
                    var requestBundle = Resolver.isBundle(moduleName);

                    module.loader.getModule(moduleName).request(InterceptionManager.intercept(module, moduleName, function onModuleLoaded(publishingModuleName, data) {
                        var percentageLoaded = Number((loaderQueue._counter++/loaderQueue._total).toFixed(2));

                        logger.log(isBundleQueue ? MSG_BUNDLE_NOTIFIED : MSG_MODULE_NOTIFIED, {
                            pub: publishingModuleName
                        });

                        loaderQueue._onModuleLoaded(publishingModuleName, data, percentageLoaded);
                        loaderQueue._callIfLoaded();
                    }, loaderQueue._onModuleAborted), loaderQueue._onModuleAborted, requestBundle);
                });
            }
            else {
                loaderQueue._callIfLoaded();
            }
        },

        _callIfLoaded: function() {
            var loaderQueue = this;

            if(loaderQueue._counter === loaderQueue._total) {
                loaderQueue._onModulesLoaded();
            }
        }
    };

    return LoaderQueue;
});
