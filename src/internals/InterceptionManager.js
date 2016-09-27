JARS.internal('InterceptionManager', function interceptionManagerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Interception = getInternal('Interception'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        objectEach = Utils.objectEach,
        interceptors = {},
        interceptionInfoCache = {},
        MSG_INTERCEPTION_ERROR = 'error in interception of this module by interceptor "${type}" with data "${data}"',
        InterceptionManager;

    /**
    * @namespace
    *
    * @memberof JARS.internals
    */
    InterceptionManager = {
        /**
         * @param {JARS.internals.Interceptor} interceptor
         */
        addInterceptor: function(interceptor) {
            var interceptorType = interceptor.type;

            if (!hasOwnProp(interceptors, interceptorType)) {
                interceptors[interceptorType] = interceptor;
            }
        },
        /**
         * @return {Object<string, JARS.internals.Interceptor>}
         */
        getInterceptors: function() {
            return interceptors;
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeInterceptionData: function(moduleName) {
            return extractInterceptionInfo(moduleName).moduleName;
        },
        /**
         * @param {JARS.internals.Module} listeningModule
         * @param {string} interceptedModuleName
         * @param {JARS.internals.StateQueue.LoadedCallback} onModuleLoaded
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         *
         * @return {JARS.internals.StateQueue.LoadedCallback}
         */
        intercept: function(listeningModule, interceptedModuleName, onModuleLoaded, onModuleAborted) {
            var interceptionInfo = extractInterceptionInfo(interceptedModuleName),
                interceptor = interceptors[interceptionInfo.type];

            return function interceptorListener(moduleName) {
                var interceptedModule = ModulesRegistry.get(moduleName),
                    ref = interceptedModule.ref;

                interceptor ? interceptor.intercept(ref, new Interception(listeningModule, interceptionInfo, function onInterceptionSuccess(data) {
                    onModuleLoaded(interceptedModuleName, data);
                }, function onInterceptionFail(error) {
                    interceptedModule.logger.error(error || MSG_INTERCEPTION_ERROR, interceptionInfo);

                    onModuleAborted(interceptedModuleName);
                })) : onModuleLoaded(moduleName, ref);
            };
        }
    };

    /**
     * @memberof JARS.internals.InterceptionManager
     * @inner
     *
     * @param {string} moduleName
     *
     * @return {JARS.internals.InterceptionInfo}
     */
    function extractInterceptionInfo(moduleName) {
        var interceptionInfo = interceptionInfoCache[moduleName],
            moduleParts;

        if (!interceptionInfo) {
            objectEach(interceptors, function findInterceptor(interceptor, interceptorType) {
                if (moduleName.indexOf(interceptorType) > -1) {
                    moduleParts = moduleName.split(interceptorType);

                    interceptionInfo = {
                        moduleName: moduleParts.shift(),

                        type: interceptorType,

                        data: moduleParts.join(interceptorType)
                    };

                    return true;
                }
            });

            interceptionInfo = interceptionInfoCache[moduleName] = interceptionInfo || {
                moduleName: moduleName
            };
        }

        return interceptionInfo;
    }

    /**
     * @typedef InterceptionInfo
     *
     * @memberof JARS.internals
     *
     * @property {string} moduleName
     * @property {string} type
     * @property {string} data
     */

    /**
     * @interface JARS.internals.Interceptor
     */

    /**
     * @member {string} JARS.internals.Interceptor#type
     */

     /**
     * @method JARS.internals.Interceptor#intercept
     *
     * @param {*} moduleRef
     * @param {JARS.internals.Interception} interception
     */

    return InterceptionManager;
});
