JARS.internal('ModulesQueue', function loaderQueueSetup(InternalsManager) {
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
     * @memberof JARS.internals.ModulesQueue
     *
     * @param {string} moduleName
     * @param {*} moduleRef
     * @param {number} [percentageLoaded]
     */

    /**
     * @callback ModulesLoadedCallback
     *
     * @memberof JARS.internals.ModulesQueue
     *
     * @param {Array<*>} moduleRefs
     */

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     * @param {string[]} moduleNames
     */
    function ModulesQueue(moduleOrBundle, moduleNames) {
        var loaderQueue = this;

        loaderQueue._moduleOrBundle = moduleOrBundle;
        loaderQueue._moduleNames = moduleNames;
    }

    ModulesQueue.prototype = {
        constructor: ModulesQueue,
        /**
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleLoaded
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         */
        request: function(onModulesLoaded, onModuleLoaded, onModuleAborted) {
            var loaderQueue = this,
                moduleOrBundle = loaderQueue._moduleOrBundle,
                logger = moduleOrBundle.logger,
                Loader = getInternal('Loader'),
                moduleNames = loaderQueue._moduleNames,
                refsIndexLookUp = {},
                refs = [],
                counter = 0,
                total = moduleNames.length;

            if(total) {
                onModuleLoaded = onModuleLoaded || onModuleLoadedNoop;
                onModuleAborted = onModuleAborted || function onModuleAbortedDefault(abortedModuleName) {
                    moduleOrBundle.abort(abortedModuleName);
                };
                
                logger.debug(MSG_SUBSCRIBED_TO, {
                    subs: moduleNames.join(SEPARATOR)
                });

                arrayEach(moduleNames, function loadModule(moduleName, moduleIndex) {
                    var requestedModule = Loader.getModule(moduleName),
                        requestedModuleOrBundle = BundleResolver.isBundle(moduleName) ? requestedModule.bundle : requestedModule;

                    refsIndexLookUp[moduleName] = moduleIndex;

                    requestedModuleOrBundle.request(InterceptionManager.intercept(moduleOrBundle, moduleName, function processOnModuleLoaded(publishingModuleName, data) {
                        var percentageLoaded = Number((counter++/total).toFixed(2)),
                            ref = System.isNil(data) ? Loader.getModuleRef(publishingModuleName) : data;

                        refs[refsIndexLookUp[publishingModuleName]] = ref;

                        logger.debug(MSG_NOTIFIED_BY, {
                            pub: publishingModuleName
                        });

                        onModuleLoaded(moduleName, ref, percentageLoaded);
                        (counter === total) && onModulesLoaded(refs);
                    }, onModuleAborted), onModuleAborted);
                });
            }
            else {
                onModulesLoaded(refs);
            }
        }
    };

    /**
     * @memberof JARS.internals.ModulesQueue
     * @inner
     */
    function onModuleLoadedNoop() {}

    return ModulesQueue;
});
