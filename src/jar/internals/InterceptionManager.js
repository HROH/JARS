JAR.internal('InterceptionManager', function(InternalsManager) {
    var utils = InternalsManager.get('utils'),
        hasOwnProp = utils.hasOwnProp,
        objectEach = utils.objectEach,
        Interception = InternalsManager.get('Interception'),
        interceptors = {},
        interceptorInfoCache = {},
        InterceptionManager;

    InterceptionManager = {
        /**
         * @access public
         *
         * @memberof JAR~InterceptionManager
         *
         * @param {Function(object)} interceptor
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
         * @memberof JAR~InterceptionManager
         *
         * @return {Object}
         */
        getInterceptors: function() {
            return interceptors;
        },
        /**
         * @access public
         *
         * @memberof JAR~InterceptionManager
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        removeInterceptionData: function(moduleName) {
            return extractInterceptorInfo(moduleName).moduleName;
        },
        /**
         * @access public
         *
         * @memberof JAR~InterceptionManager
         *
         * @param {String} listeningModuleName
         * @param {String} interceptedModuleName
         * @param {JAR~Module~successCallback} callback
         * @param {JAR~Module~failCallback} errback
         *
         * @return {JAR~Module~successCallback}
         */
        intercept: function(loader, listeningModuleName, interceptedModuleName, callback, errback) {
            var interceptorInfo = extractInterceptorInfo(interceptedModuleName),
                interceptor = interceptors[interceptorInfo.type];

            return interceptor ? function interceptorListener(moduleName) {
                interceptor.intercept(loader.getModuleRef(moduleName), new Interception(loader, listeningModuleName, interceptorInfo, callback, errback));
            } : callback;
        }
    };

    /**
     * @access private
     *
     * @memberof JAR~InterceptionManager
     * @inner
     *
     * @param {String} moduleName
     *
     * @return {Object}
     */
    function extractInterceptorInfo(moduleName) {
        var interceptorInfo = interceptorInfoCache[moduleName],
            moduleParts;

        if (!interceptorInfo) {
            objectEach(interceptors, function findInterceptor(interceptor, interceptorType) {
                if (moduleName.indexOf(interceptorType) > -1) {
                    moduleParts = moduleName.split(interceptorType);

                    interceptorInfo = {
                        moduleName: moduleParts.shift(),

                        type: interceptorType,

                        data: moduleParts.join(interceptorType)
                    };

                    return true;
                }
            });

            interceptorInfo = interceptorInfoCache[moduleName] = interceptorInfo || {
                moduleName: moduleName
            };
        }

        return interceptorInfo;
    }

    return InterceptionManager;
});
