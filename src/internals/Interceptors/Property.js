JARS.internal('Interceptors/Property', function(getInternal) {
    'use strict';

    // TODO allow search for nested properties
    var hasOwnProp = getInternal('Utils').hasOwnProp,
        Property;

    /**
    * @namespace
    *
    * @memberof JARS~internals.Interceptors
    *
    * @implements {JARS~internals.Interceptors~Interceptor}
    */
    Property = {
        /**
         * @param {JARS~internals.Interception} interception
         */
        intercept: function(interception) {
            interception.$export(function() {
                var property = interception.info.data;

                if (!hasOwnProp(this, property)) {
                    interception.fail('The module has no property "' + property + '"');
                }
                else {
                    return this[property];
                }
            });
        },
        /**
         * @type {string}
         */
        type: '::'
    };

    return Property;
});
