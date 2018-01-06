JARS.internal('GlobalConfigHooks/Interceptors', function(getInternal) {
    'use strict';

    var registerInterceptor = getInternal('Registries/Interceptors').register;

    /**
     * @method
     *
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {JARS~internals.Interceptors~Interceptor} interceptor
     */
    function Interceptors(globalConfig, interceptor) {
        registerInterceptor(interceptor);
    }

    return Interceptors;
});
