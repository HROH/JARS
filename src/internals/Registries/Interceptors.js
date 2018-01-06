JARS.internal('Registries/Interceptors', function(getInternal) {
    'use strict';

    var Utils = getInternal('Utils'),
        objectEach = Utils.objectEach,
        hasOwnProp = Utils.hasOwnProp,
        interceptors = {},
        Interceptors;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries
     */
    Interceptors = {
        /**
         * @param {JARS~internals.Interceptors~Interceptor} interceptor
         */
        register: function(interceptor) {
            if (!hasOwnProp(interceptors, interceptor.type)) {
                interceptors[interceptor.type] = interceptor;
            }
        },
        /**
         * @param {function(JARS~internals.Interceptors~Interceptor, string)} callback
         */
        each: function(callback) {
            objectEach(interceptors, callback);
        },
        /**
         * @param {string} type
         *
         * @return {JARS~internals.Interceptors~Interceptor}
         */
        get: function(type) {
            return interceptors[type];
        }
    };

    return Interceptors;
});
