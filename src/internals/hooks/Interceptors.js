JARS.internal('hooks/Interceptors', function interceptorsHookSetup(getInternal) {
    'use strict';

    var InterceptorRegistry = getInternal('InterceptorRegistry'),
        Interceptors;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {JARS.internals.Interceptor} interceptor
     */
    Interceptors = function(globalConfig, interceptor) {
        InterceptorRegistry.register(interceptor);
    };

    return Interceptors;
});
