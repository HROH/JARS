JARS.internal('GlobalConfig', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        isArray = System.isArray,
        arrayEach = getInternal('Helpers/Array').each,
        objectEach = getInternal('Helpers/Object').each,
        GlobalConfigHooks = getInternal('GlobalConfigHooks'),
        globalConfig = {
            environments: {}
        },
        GlobalConfig;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     */
    GlobalConfig = {
        /**
         * @param {(JARS~internals.GlobalConfig~Option|JARS~internals.GlobalConfig~Options)} optionOrConfigOrArray
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
         * @param {JARS~internals.GlobalConfig~Option} option
         *
         * @return {*}
         */
        get: function(option) {
            return globalConfig[option];
        }
    };

    /**
     * @memberof JARS~internals.GlobalConfig
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
     * @typedef {('debugging'|'environment'|'environments'|'globalAccess'|'interceptors'|'loaderContext'|'main'|'modules')} Option
     *
     * @memberof JARS~internals.GlobalConfig
     * @inner
     */

     /**
      * @typedef {Object} Options
      *
      * @memberof JARS~internals.GlobalConfig
      * @inner
      *
      * @property {(JARS~internals.GlobalConfig~Options.Debugging|boolean)} debugging
      * @property {string} environment
      * @property {Object<string, JARS~internals.GlobalConfig~Options>} environments
      * @property {boolean} globalAccess
      * @property {JARS~internals.Interceptors~Interceptor} interceptors
      * @property {string} loaderContext
      * @property {string} main
      * @property {JARS~internals.GlobalConfig~Options.Modules} modules
      */

    return GlobalConfig;
});
