JARS.internal('Configs/Module', function(getInternal) {
    'use strict';

    var Config = getInternal('Configs/Subject');

    /**
     * @memberof JARS~internals.Configs
     *
     * @param {JARS~internals.Subjects.Module} module
     *
     * @return {JARS~internals.Configs.Subject}
     */
    function Module(module) {
        var parentConfig = module.bundle.config;

        return module.isRoot ? parentConfig : new Config(module, parentConfig);
    }

    return Module;
});
