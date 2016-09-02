JARS.internal('PluginInterceptor', function pluginInterceptorSetup() {
    'use strict';

    /**
    * @access public
    *
    * @namespace PluginInterceptor
    * @implements JARS~InterceptionManager~Interceptor
    *
    * @memberof JARS
    * @inner
    */
    var PluginInterceptor = {
        /**
         * @access public
         *
         * @memberof JARS~PluginInterceptor
         *
         * @param {*} moduleRef
         * @param {JARS~Intereption} interception
         */
        intercept: function(moduleRef, interception) {
            if (interception.listeningModule.loader.getSystem().isFunction(moduleRef.$plugIn)) {
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
