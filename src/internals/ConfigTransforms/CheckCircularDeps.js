JARS.internal('ConfigTransforms/CheckCircularDeps', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    var CheckCircularDeps = {
        /**
         * @type {string}
         */
        type: 'boolean',
        /**
         * @param {boolean} value
         *
         * @return {boolean}
         */
        transform: function(checkCircularDeps) {
            return checkCircularDeps;
        }
    };

    return CheckCircularDeps;
});
