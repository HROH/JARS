JARS.internal('Configs/Transforms/Config', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge;

    /**
     * @memberof JARS~internals.Configs.Transforms
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
