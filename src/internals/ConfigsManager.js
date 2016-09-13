JARS.internal('ConfigsManager', function configsManagerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        ConfigHooks = getInternal('ConfigHooks'),
        objectEach = getInternal('Utils').objectEach,
        configs = {
            environments: {},

            globalAccess: false,

            supressErrors: false
        },
        ConfigsManager;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ConfigsManager = {
        /**
         * @param {(JARS.internals.ConfigsManager.Option|Object<JARS.internals.ConfigsManager.Option, *>)} optionOrConfig
         * @param {*} [value]
         */
        update: function(optionOrConfig, value) {
            var configHook;

            if (System.isString(optionOrConfig)) {
                configHook = ConfigHooks[optionOrConfig];
                configs[optionOrConfig] = System.isFunction(configHook) ? configHook(value, configs[optionOrConfig]) : value;
            }
            else if (System.isObject(optionOrConfig)) {
                objectEach(optionOrConfig, function update(value, option) {
                    ConfigsManager.update(option, value);
                });
            }
        },
        /**
         * @param {JARS.internals.ConfigsManager.Option} option
         *
         * @return {*}
         */
        get: function(option) {
            return configs[option];
        }
    };

    /**
     * @memberof JARS.internals.ConfigsManager
     * @inner
     *
     * @typedef {('debugging'|'environment'|'environments'|'globalAccess'|'interceptors'|'loaderContext'|'main'|'modules')} Option
     */

    return ConfigsManager;
});
