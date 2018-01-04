JARS.internal('Registries/Interceptor', function interceptorRegistrySetup(getInternal) {
    'use strict';

    var Utils = getInternal('Utils'),
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
            if (!hasOwnProp(interceptors, interceptor.type)) {
                interceptors[interceptor.type] = interceptor;
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
