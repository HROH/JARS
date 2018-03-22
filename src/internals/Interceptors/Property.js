JARS.internal('Interceptors/Property', function(getInternal) {
    'use strict';

    // TODO allow search for nested properties
    var hasOwnProp = getInternal('Helpers/Object').hasOwnProp,
        MSG_MISSING_PROPERTY = 'the module has no property "${0}"',
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
                    interception.stateUpdater.setAborted(MSG_MISSING_PROPERTY, [property]);
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
