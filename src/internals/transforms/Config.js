JARS.internal('transforms/Config', function configTransformSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge,
        Config;

    /**
     * @memberof JARS.internals
     */
    Config = {
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

    return Config;
});
