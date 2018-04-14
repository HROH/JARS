JARS.internal('Interceptors/Property', function(getInternal) {
    'use strict';

    // TODO allow search for nested properties
    var hasOwnProp = getInternal('Helpers/Object').hasOwnProp,
        MSG_MISSING_PROPERTY = 'the module has no property "${0}"',
        Property;

    /**
     * @namespace
     * @implements {JARS~internals.Interceptors~Interceptor}
     *
     * @memberof JARS~internals.Interceptors
     */
    Property = {
        /**
         * @param {JARS~internals.Subjects.Subject} interception
         */
        intercept: function(interception) {
            interception.$export(function() {
                var property = interception.info.data,
                    value;

                if (hasOwnProp(this, property)) {
                    value = this[property];
                }
                else {
                    interception.abort(MSG_MISSING_PROPERTY, [property]);
                }

                return value;
            });
        },
        /**
         * @type {string}
         */
        type: '::'
    };

    return Property;
});
