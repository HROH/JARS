JARS.internal('transforms/ModuleConfig', function moduleConfigTransformSetup(InternalsManager) {
    'use strict';

    var objectMerge = InternalsManager.get('Utils').objectMerge,
        ModuleConfig;

    /**
     * @memberof JARS.internals
     */
    ModuleConfig = {
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

    return ModuleConfig;
});
