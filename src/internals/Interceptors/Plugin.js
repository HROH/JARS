JARS.internal('Interceptors/Plugin', function(getInternal) {
    'use strict';

    var isFunction = getInternal('Types/Validators').isFunction,
        META_PLUGIN = 'plugIn',
        MSG_MISSING_PLUGIN_METHOD = 'could not call method "plugIn" on module "${0}"',
        Plugin;

    /**
     * @namespace
     * @implements  {JARS~internals.Interceptors~Interceptor}
     *
     * @memberof JARS~internals.Interceptors
     */
    Plugin = {
        /**
         * @param {JARS~internals.Subjects.Subject} interception
         */
        intercept: function(interception) {
            var plugIn = interception.parent.getMeta(META_PLUGIN);

            isFunction(plugIn) ? plugIn(interception, getInternal) : interception.abort(MSG_MISSING_PLUGIN_METHOD, [interception.parent.name]);
        },
        /**
         * @type {string}
         */
        type: '!'
    };

    return Plugin;
});
