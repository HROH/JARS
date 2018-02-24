JARS.internal('Configs/Transforms/Config', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge;

    /**
     * @memberof JARS~internals.Configs.Transforms
     *
     * @param {Object} config
     * @param {JARS~internals.Subjects~Subject} subject
     *
     * @return {Object}
     */
    function Config(config, subject) {
        return merge(subject.config.get('config'), config);
    }

    return Config;
});
