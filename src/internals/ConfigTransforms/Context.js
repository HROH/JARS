JARS.internal('ConfigTransforms/Context', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Config.Transforms
     *
     * @param {string} context
     *
     * @return {string}
     */
    function ContextTransform(context) {
        return context;
    }

    return ContextTransform;
});
