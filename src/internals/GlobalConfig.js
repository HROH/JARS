JARS.internal('GlobalConfig', function globalConfigSetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        Utils = getInternal('Utils'),
        isArray = System.isArray,
        arrayEach = Utils.arrayEach,
        objectEach = Utils.objectEach,
        GlobalConfigHooks = getInternal('GlobalConfigHooks'),
        globalConfig = {
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
            else if (isArray(optionOrConfigOrArray)) {
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
        if(isArray(valueOrArray)) {
            arrayEach(valueOrArray, function(value) {
                updateOption(option, value);
            });
        }
        else {
            globalConfig[option] = System.isFunction(GlobalConfigHooks[option]) ? GlobalConfigHooks[option](GlobalConfig, valueOrArray) : valueOrArray;
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
