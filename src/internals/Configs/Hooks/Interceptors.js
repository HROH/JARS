JARS.internal('Configs/Hooks/Interceptors', function(getInternal) {
    'use strict';

    var registerInterceptor = getInternal('Registries/Interceptors').register;

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
     * @param {JARS~internals.Interceptors~Interceptor} interceptor
     */
    function Interceptors(globalConfig, interceptor) {
        registerInterceptor(interceptor);
    }

    return Interceptors;
});
