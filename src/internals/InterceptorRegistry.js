JARS.internal('InterceptorRegistry', function interceptorRegistrySetup(InternalsManager) {
    'use strict';

    var Utils = InternalsManager.get('Utils'),
        objectEach = Utils.objectEach,
        hasOwnProp = Utils.hasOwnProp,
        interceptors = {},
        InterceptorRegistry;

    InterceptorRegistry = {
        register: function(interceptor) {
            var interceptorType = interceptor.type;

            if (!hasOwnProp(interceptors, interceptorType)) {
                interceptors[interceptorType] = interceptor;
            }
        },

        each: function(callback) {
            objectEach(interceptors, callback);
        },

        get: function(type) {
            return interceptors[type];
        }
    };

    return InterceptorRegistry;
});
