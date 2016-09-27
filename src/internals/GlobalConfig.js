JARS.internal('GlobalConfig', function globalConfigSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        GlobalConfigHooks = getInternal('GlobalConfigHooks'),
        objectEach = getInternal('Utils').objectEach,
        configs = {
            environments: {}
        },
        GlobalConfig;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    GlobalConfig = {
        /**
         * @param {(JARS.internals.GlobalConfig.Option|Object<JARS.internals.GlobalConfig.Option, *>)} optionOrConfig
         * @param {*} [value]
         */
        update: function(optionOrConfig, value) {
            var configHook;

            if (System.isString(optionOrConfig)) {
                configHook = GlobalConfigHooks[optionOrConfig];
                configs[optionOrConfig] = System.isFunction(configHook) ? configHook(GlobalConfig, value) : value;
            }
            else if (System.isObject(optionOrConfig)) {
                objectEach(optionOrConfig, function update(value, option) {
                    GlobalConfig.update(option, value);
                });
            }
        },
        /**
         * @param {JARS.internals.GlobalConfig.Option} option
         *
         * @return {*}
         */
        get: function(option) {
            return configs[option];
        }
    };

    /**
     * @memberof JARS.internals.GlobalConfig
     * @inner
     *
     * @typedef {('debugging'|'environment'|'environments'|'globalAccess'|'interceptors'|'loaderContext'|'main'|'modules')} Option
     */

    return GlobalConfig;
});
