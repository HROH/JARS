JARS.internal('Configs/Bundle', function(getInternal) {
    'use strict';

    var Config = getInternal('Configs/Subject');

    /**
     * @memberof JARS~internals.Configs
     *
     * @param {JARS~internals.Subjects.Bundle} bundle
     *
     * @return {JARS~internals.Configs.Subject}
     */
    function Bundle(bundle) {
        var parent = bundle.module.deps.parent;

        return new Config(bundle, parent && parent.bundle.config);
    }

    return Bundle;
});
