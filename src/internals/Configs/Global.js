JARS.internal('Configs/Global', function(getInternal) {
    'use strict';

    var Hooks = getInternal('Configs/Hooks'),
        Validators = getInternal('Types/Validators'),
        isArray = Validators.isArray,
        arrayEach = getInternal('Helpers/Array').each,
        objectEach = getInternal('Helpers/Object').each,
        globalConfig = {
            environments: {}
        },
        Global;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Configs
     */
    Global = {
        /**
         * @param {(JARS~internals.Configs.Global~Option|JARS~internals.Configs.Global~Options)} optionOrConfig
         * @param {*} [valueOrArray]
         */
        update: function(optionOrConfig, valueOrArray) {
            if (Validators.isString(optionOrConfig)) {
                updateOption(valueOrArray, optionOrConfig);
            }
            else if (Validators.isObject(optionOrConfig)) {
                objectEach(optionOrConfig, updateOption);
            }
        },
        /**
         * @param {JARS~internals.Configs.Global~Option} option
         *
         * @return {*}
         */
        get: function(option) {
            return globalConfig[option];
        }
    };

    /**
     * @memberof JARS~internals.Configs.Global
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
            globalConfig[option] = Validators.isFunction(Hooks[option]) ? Hooks[option](Global, valueOrArray) : valueOrArray;
        }
    }

    /**
     * @typedef {('debugging'|'environment'|'environments'|'globalAccess'|'interceptors'|'main'|'modules')} Option
     *
     * @memberof JARS~internals.Configs.Global
     * @inner
     */

     /**
      * @typedef {Object} Options
      *
      * @memberof JARS~internals.Configs.Global
      * @inner
      *
      * @property {(JARS~internals.Configs.Hooks~Debugging|boolean)} debugging
      * @property {string} environment
      * @property {Object<string, JARS~internals.Configs.Global~Options>} environments
      * @property {boolean} globalAccess
      * @property {JARS~internals.Interceptors~Interceptor} interceptors
      * @property {string} main
      * @property {JARS~internals.Configs.Hooks~Modules} modules
      */

    return Global;
});
