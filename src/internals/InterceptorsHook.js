JARS.internal('InterceptorsHook', function(InternalsManager) {
    'use strict';

    var InterceptorRegistry = InternalsManager.get('InterceptorRegistry'),
        InterceptorsHook;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {JARS.internals.Interceptor} interceptor
     */
    InterceptorsHook = function(globalConfig, interceptor) {
        InterceptorRegistry.register(interceptor);
    };

    return InterceptorsHook;
});
