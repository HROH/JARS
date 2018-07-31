JARS.internal('Logger/Logger', function(getInternal) {
    'use strict';

    var Levels = getInternal('Logger/Levels'),
        format = getInternal('Helpers/Formatter').format,
        merge = getInternal('Helpers/Object').merge,
        DEFAULT_DEBUG_OPTIONS = {
            debug: true,

            level: Levels.ALL
        };

    /**
     * @class
     *
     * @memberof JARS~internals.Logger
     *
     * @param {string} logContext
     * @param {Object} config
     */
    function Logger(logContext, transports, config) {
        this._context = logContext;
        this._transports = transports;
        this._config = config || merge({}, DEFAULT_DEBUG_OPTIONS);
    }

    Logger.prototype = {
        constructor: Logger,
        /**
         * @param {string} level
         * @param {*} message
         * @param {(Object|Array)} values
         */
        write: function(level, message, values) {
            var context = this._context;

            if (isDebuggingEnabled(this._config, level, context)) {
                this._transports.write(level, context, {
                    timestamp: new Date().toUTCString(),

                    message: format(message, values),

                    meta: values
                });
            }
        },
        /**
         * @param {string} subContext
         */
        subLogger: function(subContext) {
            return new Logger(subContext, this._transports, this._config);
        }
    };

    /**
     * @memberof JARS~internals.Logger.Logger
     * @inner
     *
     * @param {Object} config
     * @param {string} level
     *
     * @return {boolean}
     */
    function isDebuggingEnabled(config, level) {
        return config && config.debug && Levels.comparePriority(level, config.level);
    }

    Levels.each(function(level) {
        Logger.prototype[level] = function(data, values) {
            this.write(level, data, values);
        };
    });

    return Logger;
});
