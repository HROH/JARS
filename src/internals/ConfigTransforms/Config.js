JARS.internal('ConfigTransforms/Config', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge;

    /**
     * @memberof JARS~internals.Config.Transforms
     *
     * @param {Object} config
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} [moduleOrBundle]
     *
     * @return {Object}
     */
    function Config(config, moduleOrBundle) {
        return merge(moduleOrBundle.config.get('config'), config);
    }

    return Config;
});
