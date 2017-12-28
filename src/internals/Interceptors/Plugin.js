JARS.internal('Interceptors/Plugin', function pluginInterceptorSetup(getInternal) {
    'use strict';

    var isFunction = getInternal('System').isFunction,
        PluginInterceptor;

    /**
    * @namespace
    * @implements JARS.internals.Interceptor
    *
    * @memberof JARS.internals
    */
    PluginInterceptor = {
        /**
         * @param {*} moduleRef
         * @param {JARS.internals.Intereption} interception
         */
        intercept: function(moduleRef, interception) {
            if (isFunction(moduleRef.$plugIn)) {
                moduleRef.$plugIn(interception);
            }
            else {
                interception.fail('Could not call method "$plugIn" on this module');
            }
        },
        /**
         * @type {string}
         */
        type: '!'
    };

    return PluginInterceptor;
});
