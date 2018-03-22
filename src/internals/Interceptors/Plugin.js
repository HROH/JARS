JARS.internal('Interceptors/Plugin', function(getInternal) {
    'use strict';

    var isFunction = getInternal('Types/Validators').isFunction,
        META_PLUGIN = 'plugIn',
        MSG_MISSING_PLUGIN_METHOD = 'could not call method "plugIn" on this module',
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
         * @param {JARS~internals.Subjects.Subject} interception
         */
        intercept: function(interception) {
            var plugIn = interception.parent.getMeta(META_PLUGIN);

            isFunction(plugIn) ? plugIn(interception, getInternal) : interception.stateUpdater.setAborted(MSG_MISSING_PLUGIN_METHOD);
        },
        /**
         * @type {string}
         */
        type: '!'
    };

    return Plugin;
});
