JARS.internal('InterceptionResolver', function interceptionResolverSetup(InternalsManager) {
    'use strict';

    var InterceptorRegistry = InternalsManager.get('InterceptorRegistry'),
        interceptionInfoCache = {},
        InterceptionResolver;

    InterceptionResolver = {
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeInterceptionData: function(moduleName) {
            return InterceptionResolver.extractInterceptionInfo(moduleName).moduleName;
        },
        /**
         * @param {string} moduleName
         *
         * @return {JARS.internals.InterceptionInfo}
         */
        extractInterceptionInfo: function(moduleName) {
            var interceptionInfo = interceptionInfoCache[moduleName],
                moduleParts;

            if (!interceptionInfo) {
                InterceptorRegistry.each(function findInterceptor(interceptor, interceptorType) {
                    if (moduleName.indexOf(interceptorType) > -1) {
                        moduleParts = moduleName.split(interceptorType);

                        interceptionInfo = {
                            fullModuleName: moduleName,

                            moduleName: moduleParts.shift(),

                            type: interceptorType,

                            data: moduleParts.join(interceptorType)
                        };

                        return true;
                    }
                });

                interceptionInfo = interceptionInfoCache[moduleName] = interceptionInfo || {
                    fullModuleName: moduleName,

                    moduleName: moduleName
                };
            }

            return interceptionInfo;
        }
    };

    /**
     * @typedef InterceptionInfo
     *
     * @memberof JARS.internals
     *
     * @property {string} moduleName
     * @property {string} type
     * @property {string} data
     */

    return InterceptionResolver;
});
