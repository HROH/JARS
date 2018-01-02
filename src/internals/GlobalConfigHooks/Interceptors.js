JARS.internal('GlobalConfigHooks/Interceptors', function interceptorsHookSetup(getInternal) {
    'use strict';

    var InterceptorRegistry = getInternal('Registries/Interceptor'),
        Interceptors;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {JARS.internals.Interceptor} interceptor
     */
    Interceptors = function(globalConfig, interceptor) {
        InterceptorRegistry.register(interceptor);
    };

    return Interceptors;
});
