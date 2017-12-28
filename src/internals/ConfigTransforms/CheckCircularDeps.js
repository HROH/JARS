JARS.internal('ConfigTransforms/CheckCircularDeps', function() {
    'use strict';

    /**
     * @memberof JARS.internals.ConfigTransforms
     *
     * @param {boolean} value
     *
     * @return {boolean}
     */
    function CheckCircularDeps(checkCircularDeps) {
        return !!checkCircularDeps;
    }

    return CheckCircularDeps;
});
