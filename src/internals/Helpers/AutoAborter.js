JARS.internal('Helpers/AutoAborter', function(getInternal) {
    'use strict';

    var Recoverer = getInternal('Helpers/Recoverer'),
        global = getInternal('Env').global,
        timeoutIDs = {},
        MILLISECONDS_PER_SECOND = 1000,
        MSG_MODULE_ABORTED = 'timeout after ${sec} second(s) with given path "${path}"',
        AutoAborter;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    AutoAborter = {
        /**
         * @param {JARS~internals.Subjects.Subject} module
         * @param {string} path
         */
        setup: function(module, path) {
            var timeout = module.config.get('timeout');

            timeoutIDs[module.name] = global.setTimeout(function abortModule() {
                Recoverer(module) || module.abort(MSG_MODULE_ABORTED, {
                    path: path,

                    sec: timeout
                });
            }, timeout * MILLISECONDS_PER_SECOND);
        },
        /**
         * @param {JARS~internals.Subjects.Subject} module
         */
        clear: function(module) {
            global.clearTimeout(timeoutIDs[module.name]);
        }
    };

    return AutoAborter;
});
