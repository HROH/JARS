JARS.internal('LoaderQueue', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('utils').arrayEach,
        System = getInternal('System'),
        Resolver = getInternal('Resolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        SEPERATOR = '", "',
        MSG_SUBSCRIBED_TO = 'subscribed to "${subs}"',
        MSG_NOTIFIED_BY = 'was notified by "${pub}"';

    function LoaderQueue(module, isBundleQueue, onModulesLoaded, onModuleLoaded, onModuleAborted) {
        var loaderQueue = this,
            moduleOrBundle = isBundleQueue ? module.bundle : module;

        loaderQueue._module = module;
        loaderQueue._refs = [];
        loaderQueue._isBundleQueue = isBundleQueue;
        loaderQueue._counter = 0;
        loaderQueue._total = 0;
        loaderQueue._onModulesLoaded = onModulesLoaded;
        loaderQueue._onModuleLoaded = onModuleLoaded || onModuleLoadedNoop;
        loaderQueue._onModuleAborted =  onModuleAborted || function onModuleAbortedDefault(abortedModuleName) {
            module.isRoot() || moduleOrBundle.abort(abortedModuleName);
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
                logger.debug(MSG_SUBSCRIBED_TO, isBundleQueue, {
                    subs: moduleNames.join(SEPERATOR)
                });

                loaderQueue._total += modulesToLoad;

                arrayEach(moduleNames, function loadModule(moduleName, moduleIndex) {
                    var requestedModule = loader.getModule(moduleName),
                        requestedModuleOrBundle = Resolver.isBundle(moduleName) ? requestedModule.bundle : requestedModule;

                    refsIndexLookUp[moduleName] = loaderQueue._total - modulesToLoad + moduleIndex;

                    requestedModuleOrBundle.request(InterceptionManager.intercept(module, moduleName, function onModuleLoaded(publishingModuleName, data) {
                        var percentageLoaded = Number((loaderQueue._counter++/loaderQueue._total).toFixed(2)),
                            ref = System.isNil(data) ? loader.getModuleRef(publishingModuleName) : data;

                        loaderQueue._refs[refsIndexLookUp[publishingModuleName]] = ref;

                        logger.debug(MSG_NOTIFIED_BY, isBundleQueue, {
                            pub: publishingModuleName
                        });

                        loaderQueue._onModuleLoaded(moduleName, ref, percentageLoaded);
                        loaderQueue._callIfLoaded();
                    }, loaderQueue._onModuleAborted), loaderQueue._onModuleAborted);
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
