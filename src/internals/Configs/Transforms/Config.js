JARS.internal('Configs/Transforms/Config', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge;

    /**
     * @memberof JARS~internals.Configs.Transforms
     *
     * @param {Object} publicConfig
     * @param {Object} oldPublicConfig
     *
     * @return {JARS~internals.Configs.Public}
     */
    function Config(publicConfig, oldPublicConfig) {
        return merge(oldPublicConfig, publicConfig);
    }

    return Config;
});
