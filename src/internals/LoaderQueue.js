JARS.internal('LoaderQueue', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('utils').arrayEach,
        System = getInternal('System'),
        Resolver = getInternal('Resolver'),
        InterceptionManager = getInternal('InterceptionManager'),
        SEPARATOR = '", "',
        MSG_SUBSCRIBED_TO = 'subscribed to "${subs}"',
        MSG_NOTIFIED_BY = 'was notified by "${pub}"';

    /**
    * @callback ModuleLoadedCallback
    *
    * @memberof JARS~LoaderQueue
    * @inner
    *
    * @param {String} moduleName
    * @param {*} moduleRef
    * @param {Number} [percentageLoaded]
    */

    /**
    * @callback ModulesLoadedCallback
    *
    * @memberof JARS~LoaderQueue
    * @inner
    *
    * @param {String[]} moduleRefs
    */

    /**
    * @access public
    *
    * @constructor LoaderQueue
    *
    * @memberof JARS
    * @inner
    *
    * @param {(JARS~Module|JARS~Bundle)} moduleOrBundle
    * @param {JARS~LoaderQueue~ModulesLoadedCallback} onModulesLoaded
    * @param {JARS~LoaderQueue~ModuleLoadedCallback} onModuleLoaded
    * @param {JARS~ModuleQueue~FailCallback} onModuleAborted
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
        /**
         * @access public
         *
         * @alias JARS~LoaderQueue
         *
         * @memberof JARS~LoaderQueue#
         */
        constructor: LoaderQueue,
        /**
         * @access public
         *
         * @memberof JARS~LoaderQueue#
         *
         * @param {String[]} moduleNames
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
                        requestedModuleOrBundle = Resolver.isBundle(moduleName) ? requestedModule.bundle : requestedModule;

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
     * @access private
     *
     * @memberof JARS~LoaderQueue
     *
     * @param {JARS~LoaderQueue} loaderQueue
     */
    function callIfLoaded(loaderQueue) {
        if(loaderQueue._counter === loaderQueue._total) {
            loaderQueue._onModulesLoaded(loaderQueue._refs);
        }
    }

    /**
     * @access private
     *
     * @memberof JARS~LoaderQueue
     */
    function onModuleLoadedNoop() {}

    return LoaderQueue;
});
