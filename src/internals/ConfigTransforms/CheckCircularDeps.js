JARS.internal('ConfigTransforms/CheckCircularDeps', function() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var CheckCircularDeps = {
        type: 'boolean',
        /**
         * @param {*} value
         *
         * @return {*}
         */
        transform: function(checkCircularDeps) {
            return checkCircularDeps;
        }
    };

    return CheckCircularDeps;
});
