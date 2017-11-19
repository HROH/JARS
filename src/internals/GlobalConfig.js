JARS.internal('GlobalConfig', function globalConfigSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        arrayEach = getInternal('Utils').arrayEach,
        objectEach = getInternal('Utils').objectEach,
        hookKeys = ['debugging', 'environment', 'environments', 'globalAccess', 'interceptors', 'loaderContext', 'main', 'modules'],
        globalConfigHooks = {},
        globalConfig = {
            environments: {}
        },
        GlobalConfig;

        arrayEach(hookKeys, function(hookKey) {
            globalConfigHooks[hookKey] = getInternal('hooks/' + hookKey.charAt(0).toUpperCase() + hookKey.substr(1));
        });

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    GlobalConfig = {
        /**
         * @param {(JARS.internals.GlobalConfig.Option|Object<JARS.internals.GlobalConfig.Option, *>)} optionOrConfigOrArray
         * @param {*} [valueOrArray]
         */
        update: function(optionOrConfigOrArray, valueOrArray) {
            if (System.isString(optionOrConfigOrArray)) {
                updateOption(optionOrConfigOrArray, valueOrArray);
            }
            else if (System.isObject(optionOrConfigOrArray)) {
                objectEach(optionOrConfigOrArray, function updateConfig(value, option) {
                    GlobalConfig.update(option, value);
                });
            }
            else if (System.isArray(optionOrConfigOrArray)) {
                arrayEach(optionOrConfigOrArray, GlobalConfig.update);
            }
        },
        /**
         * @param {JARS.internals.GlobalConfig.Option} option
         *
         * @return {*}
         */
        get: function(option) {
            return globalConfig[option];
        }
    };

    /**
     * @memberof JARS.internals.GlobalConfig
     * @inner
     *
     * @param {string} option
     * @param {(*|Array<*>)} valueOrArray
     */
    function updateOption(option, valueOrArray) {
        var configHook;

        if(System.isArray(valueOrArray)) {
            arrayEach(valueOrArray, function(value) {
                updateOption(option, value);
            });
        }
        else {
            configHook = globalConfigHooks[option];
            globalConfig[option] = System.isFunction(configHook) ? configHook(GlobalConfig, valueOrArray) : valueOrArray;
        }
    }

    /**
     * @memberof JARS.internals.GlobalConfig
     * @inner
     *
     * @typedef {('debugging'|'environment'|'environments'|'globalAccess'|'interceptors'|'loaderContext'|'main'|'modules')} Option
     */

    return GlobalConfig;
});
