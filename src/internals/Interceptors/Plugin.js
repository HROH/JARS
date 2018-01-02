JARS.internal('Interceptors/Plugin', function pluginInterceptorSetup(getInternal) {
    'use strict';

    var getModule = getInternal('Registries/Modules').get,
        isFunction = getInternal('System').isFunction,
        PluginInterceptor;

    /**
    * @namespace
    * @implements JARS.internals.Interceptor
    *
    * @memberof JARS.internals
    */
    PluginInterceptor = {
        /**
         * @param {JARS.internals.Interception} interception
         */
        intercept: function(interception) {
            var plugIn = getModule(interception.info.moduleName).getMeta('plugIn');

            isFunction(plugIn) ? plugIn(interception) : interception.fail('Could not call method "plugIn" on this module');
        },
        /**
         * @type {string}
         */
        type: '!'
    };

    return PluginInterceptor;
});
