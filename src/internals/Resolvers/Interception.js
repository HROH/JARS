JARS.internal('Resolvers/Interception', function(getInternal) {
    'use strict';

    var eachInterceptor = getInternal('Registries/Interceptors').each,
        interceptionInfoCache = {},
        Interception;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Interception = {
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeInterceptionData: function(moduleName) {
            return Interception.extractInterceptionInfo(moduleName).moduleName;
        },
        /**
         * @param {string} moduleName
         *
         * @return {JARS~internals.Subjects.Interception~Info}
         */
        extractInterceptionInfo: function(moduleName) {
            var interceptionInfo = interceptionInfoCache[moduleName],
                moduleParts;

            if (!interceptionInfo) {
                eachInterceptor(function findInterceptor(interceptor, interceptorType) {
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

    return Interception;
});
