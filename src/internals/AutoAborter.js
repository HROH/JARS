JARS.internal('AutoAborter', function autoAborterSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Recoverer = getInternal('Recoverer'),
        global = getInternal('System').env.global,
        timeoutIDs = {},
        MILLISECONDS_PER_SECOND = 1000,
        MSG_MODULE_ABORTED = 'given path "${path}" after ${sec} second(s) - file may not exist',
        AutoAborter;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    AutoAborter = {
        /**
         * @param {JARS.internals.Module}
         * @param {string} path
         */
        setup: function(module, path) {
            var timeout = module.config.get('timeout');

            timeoutIDs[module.name] = global.setTimeout(function abortModule() {
                Recoverer.recover(module) || module.state.setAborted(MSG_MODULE_ABORTED, {
                    path: path,

                    sec: timeout
                });
            }, timeout * MILLISECONDS_PER_SECOND);
        },
        /**
         * @param {JARS.internals.Module}
         */
        clear: function(module) {
            global.clearTimeout(timeoutIDs[module.name]);
        }
    };

    return AutoAborter;
});
