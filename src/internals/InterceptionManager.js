JARS.internal('InterceptionManager', function interceptionManagerSetup(InternalsManager) {
    'use strict';

    var Utils = InternalsManager.get('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        objectEach = Utils.objectEach,
        Interception = InternalsManager.get('Interception'),
        interceptors = {},
        interceptionInfoCache = {},
        InterceptionManager;

    /**
    * @namespace
    *
    * @memberof JARS.internals
    */
    InterceptionManager = {
        /**
         * @param {JARS.internals.InterceptionManager.Interceptor} interceptor
         */
        addInterceptor: function(interceptor) {
            var interceptorType =  interceptor.type;

            if (!hasOwnProp(interceptors, interceptorType)) {
                interceptors[interceptorType] = interceptor;
            }
        },
        /**
         * @return {Object<string, JARS.internals.InterceptionManager.Interceptor>}
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
         * @param {JARS.internals.ModuleQueue.SuccessCallback} onModuleLoaded
         * @param {JARS.internals.ModuleQueue.FailCallback} onModuleAborted
         *
         * @return {JARS.internals.ModuleQueue.SuccessCallback}
         */
        intercept: function(listeningModule, interceptedModuleName, onModuleLoaded, onModuleAborted) {
            var interceptorInfo = extractInterceptionInfo(interceptedModuleName),
                interceptor = interceptors[interceptorInfo.type];

            return interceptor ? function interceptorListener(moduleName) {
                interceptor.intercept(listeningModule.loader.getModuleRef(moduleName), new Interception(listeningModule, interceptorInfo, onModuleLoaded, onModuleAborted));
            } : onModuleLoaded;
        }
    };

    /**
     * @memberof JARS.internals.InterceptionManager
     * @inner
     *
     * @param {string} moduleName
     *
     * @return {JARS.internals.InterceptionManager.InterceptionInfo}
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
     * @memberof JARS.internals.InterceptionManager
     *
     * @property {string} moduleName
     * @property {string} type
     * @property {string} data
     */

    /**
     * @class JARS.internals.InterceptionManager.Interceptor
     * @abstract
     */

    /**
     * @member {string} JARS.internals.InterceptionManager.Interceptor#type
     */

     /**
     * @method JARS.internals.InterceptionManager.Interceptor#intercept
     *
     * @param {*} moduleRef
     * @param {JARS.internals.Interception} interception
     */

    return InterceptionManager;
});
