JARS.internal('ModuleConfigTransform', function moduleConfigTransformSetup(InternalsManager) {
    'use strict';

    var objectMerge = InternalsManager.get('Utils').objectMerge,
        ModuleConfigTransform;

    /**
     * @memberof JARS.internals
     */
    ModuleConfigTransform = {
        type: 'object',
        /**
         * @param {object} newConfig
         * @param {(JARS.internals.Module|JARS.internals.Bundle)} [moduleOrBundle]
         *
         * @return {object}
         */
        transform: function(newConfig, moduleOrBundle) {
            return objectMerge(moduleOrBundle.config.get('config'), newConfig);
        }
    };

    return ModuleConfigTransform;
});
