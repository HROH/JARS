JARS.internal('hooks/Interceptors', function interceptorsHookSetup(InternalsManager) {
    'use strict';

    var InterceptorRegistry = InternalsManager.get('InterceptorRegistry'),
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
