JARS.internal('ConfigTransforms/Config', function(getInternal) {
    'use strict';

    var objectMerge = getInternal('Utils').objectMerge;

    /**
     * @memberof JARS~internals.Config.Transforms
     *
     * @param {Object} config
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} [moduleOrBundle]
     *
     * @return {Object}
     */
    function Config(config, moduleOrBundle) {
        return objectMerge(moduleOrBundle.config.get('config'), config);
    }

    return Config;
});
