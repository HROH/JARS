JARS.internal('AutoAborter', function(InternalsManager) {
    'use strict';

    var global = InternalsManager.get('System').env.global,
        timeoutIDs = {},
        MILLISECONDS_PER_SECOND = 1000,
        AutoAborter;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    AutoAborter = {
        /**
         * @param {JARS.internals.Module}
         */
        setup: function(module) {
            timeoutIDs[module.name] = global.setTimeout(function abortModule() {
                module.abort();
            }, module.config.get('timeout') * MILLISECONDS_PER_SECOND);
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
