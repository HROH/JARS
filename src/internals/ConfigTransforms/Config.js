JARS.internal('ConfigTransforms/Config', function configTransformSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge,
        Config;

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    Config = {
        /**
         * @type {string}
         */
        type: 'object',
        /**
         * @param {object} config
         * @param {(JARS.internals.Module|JARS.internals.Bundle)} [moduleOrBundle]
         *
         * @return {object}
         */
        transform: function(config, moduleOrBundle) {
            return objectMerge(moduleOrBundle.config.get('config'), config);
        }
    };

    return Config;
});
