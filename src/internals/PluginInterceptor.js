JARS.internal('PluginInterceptor', function pluginInterceptorSetup(InternalsManager) {
    'use strict';

    var System = InternalsManager.get('System'),
        PluginInterceptor;

    /**
    * @access public
    *
    * @namespace PluginInterceptor
    * @implements JARS~InterceptionManager~Interceptor
    *
    * @memberof JARS
    * @inner
    */
    PluginInterceptor = {
        /**
         * @access public
         *
         * @memberof JARS~PluginInterceptor
         *
         * @param {*} moduleRef
         * @param {JARS~Intereption} interception
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
         * @access public
         *
         * @memberof JARS~PluginInterceptor
         *
         * @property {String}
         */
        type: '!'
    };

    return PluginInterceptor;
});
