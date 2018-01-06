JARS.internal('ConfigTransforms/CheckCircularDeps', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Config.Transforms
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
