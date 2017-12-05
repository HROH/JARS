JARS.internal('ConfigTransforms/Config', function configTransformSetup(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge;

    /**
     * @memberof JARS.internals.ConfigTransforms
     *
     * @param {object} config
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} [moduleOrBundle]
     *
     * @return {object}
     */
    function Config(config, moduleOrBundle) {
        return objectMerge(moduleOrBundle.config.get('config'), config);
    }

    return Config;
});
