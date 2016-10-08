JARS.internal('InterceptorRegistry', function interceptorRegistrySetup(InternalsManager) {
    'use strict';

    var Utils = InternalsManager.get('Utils'),
        objectEach = Utils.objectEach,
        hasOwnProp = Utils.hasOwnProp,
        interceptors = {},
        InterceptorRegistry;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    InterceptorRegistry = {
        /**
         * @param {JARS.internals.Interceptor} interceptor
         */
        register: function(interceptor) {
            var interceptorType = interceptor.type;

            if (!hasOwnProp(interceptors, interceptorType)) {
                interceptors[interceptorType] = interceptor;
            }
        },
        /**
         * @param {function(JARS.internals.Interceptor, string)} callback
         */
        each: function(callback) {
            objectEach(interceptors, callback);
        },
        /**
         * @param {string} type
         *
         * @return {JARS.internals.Interceptor}
         */
        get: function(type) {
            return interceptors[type];
        }
    };

    return InterceptorRegistry;
});
