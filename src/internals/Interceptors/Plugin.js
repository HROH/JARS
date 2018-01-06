JARS.internal('Interceptors/Plugin', function(getInternal) {
    'use strict';

    var getModule = getInternal('Registries/Modules').get,
        isFunction = getInternal('System').isFunction,
        Plugin;

    /**
    * @namespace
    *
    * @memberof JARS~internals.Interceptors
    *
    * @implements  {JARS~internals.Interceptors~Interceptor}
    */
    Plugin = {
        /**
         * @param {JARS~internals.Interception} interception
         */
        intercept: function(interception) {
            var plugIn = getModule(interception.info.moduleName).getMeta('plugIn');

            isFunction(plugIn) ? plugIn(interception) : interception.fail('Could not call method "plugIn" on this module');
        },
        /**
         * @type {string}
         */
        type: '!'
    };

    return Plugin;
});
