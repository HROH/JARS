JARS.internal('GlobalConfig', function(getInternal) {
    'use strict';

    var Hooks = getInternal('GlobalConfigHooks'),
        System = getInternal('System'),
        isArray = System.isArray,
        arrayEach = getInternal('Helpers/Array').each,
        objectEach = getInternal('Helpers/Object').each,
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
         * @param {(JARS~internals.GlobalConfig~Option|JARS~internals.GlobalConfig~Options)} optionOrConfig
         * @param {*} [valueOrArray]
         */
        update: function(optionOrConfig, valueOrArray) {
            if (System.isString(optionOrConfig)) {
                updateOption(valueOrArray, optionOrConfig);
            }
            else if (System.isObject(optionOrConfig)) {
                objectEach(optionOrConfig, updateOption);
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
     * @param {(*|Array<*>)} valueOrArray
     * @param {string} option
     */
    function updateOption(valueOrArray, option) {
        if(isArray(valueOrArray)) {
            arrayEach(valueOrArray, function(value) {
                updateOption(value, option);
            });
        }
        else {
            globalConfig[option] = System.isFunction(Hooks[option]) ? Hooks[option](GlobalConfig, valueOrArray) : valueOrArray;
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
