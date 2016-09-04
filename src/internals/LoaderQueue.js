JARS.internal('LoaderQueue', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('utils').arrayEach,
        System = getInternal('System'),
        Resolver = getInternal('Resolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        ModuleLogger = getInternal('ModuleLogger'),
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
        var loaderQueue = this;

        loaderQueue._module = module;
        loaderQueue._refs = [];
        loaderQueue._isBundleQueue = isBundleQueue;
        loaderQueue._counter = 0;
        loaderQueue._total = 0;
        loaderQueue._onModulesLoaded = onModulesLoaded;
        loaderQueue._onModuleLoaded = onModuleLoaded || onModuleLoadedNoop;
        loaderQueue._onModuleAborted =  onModuleAborted || function onModuleAbortedDefault(abortedModuleName) {
            module.isRoot() || module.abort(isBundleQueue, abortedModuleName);
        };
    }

    LoaderQueue.prototype = {
        constructor: LoaderQueue,

        loadModules: function(moduleNames) {
            var loaderQueue = this,
                module = loaderQueue._module,
                loader = module.loader,
                logger = module.logger,
                isBundleQueue = loaderQueue._isBundleQueue,
                modulesToLoad = moduleNames.length,
                refsIndexLookUp = {};

            if(modulesToLoad) {
                logger.log(isBundleQueue ? MSG_BUNDLE_SUBSCRIBED : MSG_MODULE_SUBSCRIBED, {
                    subs: moduleNames.join(SEPERATOR)
                });

                loaderQueue._total += modulesToLoad;

                arrayEach(moduleNames, function loadModule(moduleName, moduleIndex) {
                    var requestBundle = Resolver.isBundle(moduleName);

                    refsIndexLookUp[moduleName] = loaderQueue._total - modulesToLoad + moduleIndex;

                    loader.getModule(moduleName).request(InterceptionManager.intercept(module, moduleName, function onModuleLoaded(publishingModuleName, data) {
                        var percentageLoaded = Number((loaderQueue._counter++/loaderQueue._total).toFixed(2)),
                            ref = System.isNil(data) ? loader.getModuleRef(publishingModuleName) : data;

                        loaderQueue._refs[refsIndexLookUp[publishingModuleName]] = ref;

                        logger.log(isBundleQueue ? MSG_BUNDLE_NOTIFIED : MSG_MODULE_NOTIFIED, {
                            pub: publishingModuleName
                        });

                        loaderQueue._onModuleLoaded(moduleName, ref, percentageLoaded);
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
                loaderQueue._onModulesLoaded(loaderQueue._refs);
            }
        }
    };

    function onModuleLoadedNoop() {}

    return LoaderQueue;
});
