JARS.internal('Registries/Interceptors', function(getInternal) {
    'use strict';

    var ObjectHelper = getInternal('Helpers/Object'),
        each = ObjectHelper.each,
        hasOwnProp = ObjectHelper.hasOwnProp,
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
            each(interceptors, callback);
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
