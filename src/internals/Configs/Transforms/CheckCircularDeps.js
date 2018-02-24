JARS.internal('Configs/Transforms/CheckCircularDeps', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Configs.Transforms
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
