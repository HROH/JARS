JARS.internal('PluginInterceptor', function pluginInterceptorSetup(InternalsManager) {
    'use strict';

    var System = InternalsManager.get('System'),
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
            if (System.isFunction(moduleRef.$plugIn)) {
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
