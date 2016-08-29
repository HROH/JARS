JARS.internal('InterceptionManager', function interceptionManagerSetup(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        hasOwnProp = utils.hasOwnProp,
        objectEach = utils.objectEach,
        Interception = InternalsManager.get('Interception'),
        interceptors = {},
        interceptionInfoCache = {},
        InterceptionManager;

    /**
    * @access public
    *
    * @namespace InterceptionManager
    *
    * @memberof JARS
    * @inner
    */
    InterceptionManager = {
        /**
         * @access public
         *
         * @memberof JARS~InterceptionManager
         *
         * @param {JARS~InterceptionManager~Interceptor} interceptor
         */
        addInterceptor: function(interceptor) {
            var interceptorType =  interceptor.type;

            if (!hasOwnProp(interceptors, interceptorType)) {
                interceptors[interceptorType] = interceptor;
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~InterceptionManager
         *
         * @return {Object<String, JARS~InterceptionManager~Interceptor>}
         */
        getInterceptors: function() {
            return interceptors;
        },
        /**
         * @access public
         *
         * @memberof JARS~InterceptionManager
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        removeInterceptionData: function(moduleName) {
            return extractInterceptionInfo(moduleName).moduleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~InterceptionManager
         *
         * @param {String} listeningModuleName
         * @param {String} interceptedModuleName
         * @param {JARS~Module~SuccessCallback} callback
         * @param {JARS~Module~FailCallback} errback
         *
         * @return {JARS~Module~SuccessCallback}
         */
        intercept: function(loader, listeningModuleName, interceptedModuleName, callback, errback) {
            var interceptorInfo = extractInterceptionInfo(interceptedModuleName),
                interceptor = interceptors[interceptorInfo.type];

            return interceptor ? function interceptorListener(moduleName) {
                interceptor.intercept(loader.getModuleRef(moduleName), new Interception(loader, listeningModuleName, interceptorInfo, callback, errback));
            } : callback;
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~InterceptionManager
     * @inner
     *
     * @param {String} moduleName
     *
     * @return {JARS~InterceptionManager~InterceptionInfo}
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
     * @memberof JARS~InterceptionManager
     * @inner
     *
     * @property {String} moduleName
     * @property {String} type
     * @property {String} data
     */

    /**
     * @access public
     *
     * @interface Interceptor
     *
     * @memberof JARS~InterceptionManager
     * @inner
     */

    /**
     * @member {String} JARS~InterceptionManager~Interceptor#type
     */

     /**
     * @method intercept
     *
     * @memberof JARS~InterceptionManager~Interceptor#
     *
     * @param {*} moduleRef
     * @param {JARS~Interception} interception
     */

    return InterceptionManager;
});
