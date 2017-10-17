JARS.internal('ModuleConfigTransform', function moduleConfigTransformSetup(InternalsManager) {
    'use strict';

    var Utils = InternalsManager.get('Utils'),
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
            return Utils.objectMerge(moduleOrBundle.config.get('config'), newConfig);
        }
    };

    return ModuleConfigTransform;
});
