JARS.internal('PluginInterceptor', function pluginInterceptorSetup() {
    var PluginInterceptor = {
        intercept: function(moduleRef, interception) {
            if (interception.loader.getSystem().isFunction(moduleRef.$plugIn)) {
                moduleRef.$plugIn(interception);
            }
            else {
                interception.fail('Could not call method "$plugIn" on this module');
            }
        },

        type: '!'
    };

    return PluginInterceptor;
});
