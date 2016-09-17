JARS.internal('LoaderQueue', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('Utils').arrayEach,
        System = getInternal('System'),
        BundleResolver = getInternal('BundleResolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        SEPARATOR = '", "',
        MSG_SUBSCRIBED_TO = 'subscribed to "${subs}"',
        MSG_NOTIFIED_BY = 'was notified by "${pub}"';

    /**
    * @callback ModuleLoadedCallback
    *
    * @memberof JARS.internals.LoaderQueue
    *
    * @param {string} moduleName
    * @param {*} moduleRef
    * @param {number} [percentageLoaded]
    */

    /**
    * @callback ModulesLoadedCallback
    *
    * @memberof JARS.internals.LoaderQueue
    *
    * @param {Array<*>} moduleRefs
    */

    /**
    * @class
    *
    * @memberof JARS.internals
    *
    * @param {(JARS.internals.Module|JARS.internals.ModuleBundle)} moduleOrBundle
    * @param {JARS.internals.LoaderQueue.ModulesLoadedCallback} onModulesLoaded
    * @param {JARS.internals.LoaderQueue.ModuleLoadedCallback} onModuleLoaded
    * @param {JARS.internals.ModuleQueue.FailCallback} onModuleAborted
    */
    function LoaderQueue(moduleOrBundle, onModulesLoaded, onModuleLoaded, onModuleAborted) {
        var loaderQueue = this;

        loaderQueue._moduleOrBundle = moduleOrBundle;
        loaderQueue._refs = [];
        loaderQueue._counter = 0;
        loaderQueue._total = 0;
        loaderQueue._onModulesLoaded = onModulesLoaded;
        loaderQueue._onModuleLoaded = onModuleLoaded || onModuleLoadedNoop;
        loaderQueue._onModuleAborted =  onModuleAborted || function onModuleAbortedDefault(abortedModuleName) {
            moduleOrBundle.abort(abortedModuleName);
        };
    }

    LoaderQueue.prototype = {
        constructor: LoaderQueue,
        /**
         * @param {string[]} moduleNames
         */
        loadModules: function(moduleNames) {
            var loaderQueue = this,
                moduleOrBundle = loaderQueue._moduleOrBundle,
                logger = moduleOrBundle.logger,
                Loader = getInternal('Loader'),
                modulesToLoad = moduleNames.length,
                refsIndexLookUp = {};

            if(modulesToLoad) {
                logger.debug(MSG_SUBSCRIBED_TO, {
                    subs: moduleNames.join(SEPARATOR)
                });

                loaderQueue._total += modulesToLoad;

                arrayEach(moduleNames, function loadModule(moduleName, moduleIndex) {
                    var requestedModule = Loader.getModule(moduleName),
                        requestedModuleOrBundle = BundleResolver.isBundle(moduleName) ? requestedModule.bundle : requestedModule;

                    refsIndexLookUp[moduleName] = loaderQueue._total - modulesToLoad + moduleIndex;

                    requestedModuleOrBundle.request(InterceptionManager.intercept(moduleOrBundle, moduleName, function onModuleLoaded(publishingModuleName, data) {
                        var percentageLoaded = Number((loaderQueue._counter++/loaderQueue._total).toFixed(2)),
                            ref = System.isNil(data) ? Loader.getModuleRef(publishingModuleName) : data;

                        loaderQueue._refs[refsIndexLookUp[publishingModuleName]] = ref;

                        logger.debug(MSG_NOTIFIED_BY, {
                            pub: publishingModuleName
                        });

                        loaderQueue._onModuleLoaded(moduleName, ref, percentageLoaded);
                        callIfLoaded(loaderQueue);
                    }, loaderQueue._onModuleAborted), loaderQueue._onModuleAborted);
                });
            }
            else {
                callIfLoaded(loaderQueue);
            }
        }
    };

    /**
     * @memberof JARS.internals.LoaderQueue
     * @inner
     *
     * @param {JARS.internals.LoaderQueue} loaderQueue
     */
    function callIfLoaded(loaderQueue) {
        if(loaderQueue._counter === loaderQueue._total) {
            loaderQueue._onModulesLoaded(loaderQueue._refs);
        }
    }

    /**
     * @memberof JARS.internals.LoaderQueue
     * @inner
     */
    function onModuleLoadedNoop() {}

    return LoaderQueue;
});
