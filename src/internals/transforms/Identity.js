JARS.internal('transforms/Identity', function identityTransformSetup() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var Identity = {
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

    return Identity;
});
