JARS.internal('ModulesQueue', function loaderQueueSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('Utils').arrayEach,
        ModulesRegistry = getInternal('ModulesRegistry'),
        BundleResolver = getInternal('BundleResolver'),
        Interception = getInternal('Interception'),
        InterceptionResolver = getInternal('InterceptionResolver'),
        InterceptorRegistry = getInternal('InterceptorRegistry'),
        SEPARATOR = '", "',
        MSG_SUBSCRIBED_TO = 'subscribed to "${subs}"',
        MSG_NOTIFIED_BY = 'was notified by "${pub}"';

    /**
     * @callback ModuleLoadedCallback
     *
     * @memberof JARS.internals.ModulesQueue
     *
     * @param {string} moduleName
     * @param {*} moduleRefOrData
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
         * @param {JARS.internals.State.AbortedCallback} onModuleAborted
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} [onModuleLoaded]
         */
        request: function(onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var loaderQueue = this,
                moduleOrBundle = loaderQueue._moduleOrBundle,
                logger = moduleOrBundle.logger,
                moduleNames = loaderQueue._moduleNames,
                refsIndexLookUp = {},
                refs = [],
                counter = 0,
                total = moduleNames.length;

            if(total) {
                onModuleLoaded = onModuleLoaded || onModuleLoadedNoop;

                logger.debug(MSG_SUBSCRIBED_TO, {
                    subs: moduleNames.join(SEPARATOR)
                });

                arrayEach(moduleNames, function loadModule(requestedModuleName, moduleIndex) {
                    var requestedModule = ModulesRegistry.get(requestedModuleName),
                        requestedModuleOrBundle = BundleResolver.isBundle(requestedModuleName) ? requestedModule.bundle : requestedModule;

                    refsIndexLookUp[requestedModuleName] = moduleIndex;

                    requestedModuleOrBundle.request(function interceptorListener() {
                        var interceptionInfo = InterceptionResolver.extractInterceptionInfo(requestedModuleName),
                            interceptor = InterceptorRegistry.get(interceptionInfo.type),
                            ref = requestedModule.ref;

                        if(interceptor) {
                            interceptor.intercept(ref, new Interception(moduleOrBundle, interceptionInfo, processOnModuleLoaded, onModuleAborted));
                        }
                        else {
                            processOnModuleLoaded(requestedModuleName, ref);
                        }
                    }, onModuleAborted);
                });
            }
            else {
                onModulesLoaded(refs);
            }

            function processOnModuleLoaded(publishingModuleName, refOrData) {
                refs[refsIndexLookUp[publishingModuleName]] = refOrData;

                logger.debug(MSG_NOTIFIED_BY, {
                    pub: publishingModuleName
                });

                onModuleLoaded(publishingModuleName, refOrData, Number((counter++/total).toFixed(2)));
                (counter === total) && onModulesLoaded(refs);
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
