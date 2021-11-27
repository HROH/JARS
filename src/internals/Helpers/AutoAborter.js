JARS.internal('Helpers/AutoAborter', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge,
        Recoverer = getInternal('Helpers/Recoverer'),
        PathResolver = getInternal('Resolvers/Path'),
        loadSource = getInternal('SourceManager').load,
        global = getInternal('Env').global,
        TIMEOUT = getInternal('Configs/Options').TIMEOUT,
        timeoutIDs = {},
        MILLISECONDS_PER_SECOND = 1000,
        MSG_MODULE_RECOVERING = 'failed to load from path "${path}" and tries to recover...',
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
         */
        setup: function(module) {
            var path = PathResolver(module),
                timeout = module.config.get(TIMEOUT);

            timeoutIDs[module.name] = global.setTimeout(function abortModule() {
                var nextConfig = Recoverer(module);

                if(nextConfig) {
                    module.logger.warn(MSG_MODULE_RECOVERING, {
                        path: path
                    });
                    module.config.update(merge({}, nextConfig));
                    AutoAborter.setup(module);
                }
                else {
                    module.abort(MSG_MODULE_ABORTED, {
                        path: path,

                        sec: timeout
                    });
                }
            }, timeout * MILLISECONDS_PER_SECOND);

            loadSource(path);
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
