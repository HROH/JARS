JARS.internal('GlobalConfigHooks/Interceptors', function interceptorsHookSetup(getInternal) {
    'use strict';

    var registerInterceptor = getInternal('Registries/Interceptor').register;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {JARS.internals.Interceptor} interceptor
     */
    function Interceptors(globalConfig, interceptor) {
        registerInterceptor(interceptor);
    }

    return Interceptors;
});
