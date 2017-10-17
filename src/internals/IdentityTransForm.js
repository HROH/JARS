JARS.internal('IdentityTransform', function identityTransformSetup() {
    'use strict';

    var IdentityTransform;

    /**
     * @memberof JARS.internals
     */
    IdentityTransform = {
        type: 'boolean',
        /**
         * @param {*} value
         *
         * @return {*}
         */
        transform: function(value) {
            return value;
        }
    };

    return IdentityTransform;
});
