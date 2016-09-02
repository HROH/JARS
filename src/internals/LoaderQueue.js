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

    function LoaderQueue(module, isBundleQueue, callback, progressback, errback) {
        this._module = module;
        this._isBundleQueue = isBundleQueue;
        this._counter = 0;
        this._total = 0;
        this._callback = callback;
        this._progressback = progressback;
        this._errback = errback || function onModuleAborted(abortedModuleName) {
            module.isRoot() || module.abort(isBundleQueue, abortedModuleName);
        };
    }

    LoaderQueue.prototype = {
        constructor: LoaderQueue,

        loadModules: function(moduleNames) {
            var loaderQueue = this,
                module = loaderQueue._module,
                logger = module.logger,
                loader = module.loader,
                isBundleQueue = loaderQueue._isBundleQueue,
                listenerName = module.getName(isBundleQueue);

            logger.log(isBundleQueue ? MSG_BUNDLE_SUBSCRIBED : MSG_MODULE_SUBSCRIBED, {
                subs: moduleNames.join(SEPERATOR)
            });

            loaderQueue._total += moduleNames.length;

            arrayEach(moduleNames, function loadModule(moduleName) {
                var isBundle = Resolver.isBundle(moduleName);

                loader.getModule(moduleName).request(isBundle).onLoad(InterceptionManager.intercept(loader, listenerName, moduleName, function onModuleLoaded(publishingModuleName, data) {
                    var percentageLoaded = Number((loaderQueue._counter++/loaderQueue._total).toFixed(2));

                    logger.log(isBundleQueue ? MSG_BUNDLE_NOTIFIED : MSG_MODULE_NOTIFIED, {
                        pub: publishingModuleName
                    });

                    loaderQueue._progressback(publishingModuleName, data, percentageLoaded);
                    loaderQueue._callIfReady();
                }, loaderQueue._errback), loaderQueue._errback, isBundle);
            });

            !loaderQueue._total && loaderQueue._callIfReady();
        },

        _callIfReady: function() {
            var loaderQueue = this;

            if(loaderQueue._counter === loaderQueue._total) {
                loaderQueue._callback();
            }
        }
    };

    return LoaderQueue;
});
