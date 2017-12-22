/**
 * @module System.Logger
 * @see JARS.internals.System.Logger
 */
JARS.module('System.Logger').$import([
    '.!',
    '.Transports',
    '.Formatter::format',
    '.LogContext',
    '.LogLevels',
    '.Modules::getCurrentModuleData'
]).$export(function systemLoggerSetup(config, Transports, format, LogContext, LogLevels, getCurrentModuleData) {
    'use strict';

    var loggerCache = {},
        ROOT_LOGCONTEXT = getCurrentModuleData().moduleName;

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {boolean} debug
     * @param {string} level
     * @param {string} context
     *
     * @return {boolean}
     */
    function isDebuggingEnabled(options, level, context) {
        return getOption(options, 'debug') && LogLevels.comparePriority(level, getOption(options, 'level')) && LogContext.isCurrent(context);
    }

    function getOption(options, option) {
        return options[option] || config[option];
    }

    /**
     * @memberof JARS.internals.System
     *
     * @class
     *
     * @param {string} logContext
     * @param {Object} options
     */
    function Logger(logContext, options) {
        var logger = this;

        logger.context = logContext;
        logger.options = options || {};
    }

    Logger.get = function(logContext, options) {
        return loggerCache[logContext] || (loggerCache[logContext] = new Logger(logContext, options));
    };

    /**
     * @param {Object} options
     *
     * @return {JARS.internals.System.Logger}
     */
    Logger.forCurrentModule = function(options) {
        return Logger.get(getCurrentModuleData().moduleName, options);
    };

    /**
     * @param {string} level
     * @param {*} message
     * @param {(Object|Array)} values
     */
    Logger.prototype.write = function(level, message, values) {
        var options = this.options,
            context = this.context;

        if (isDebuggingEnabled(options, level, context)) {
            Transports.write(getOption(options, 'mode'), level, context, {
                timestamp: new Date().toUTCString(),

                message: format(message, values),

                meta: values
            });
        }
    };

    LogLevels.each(function addLoggerMethod(level) {
        var levelWithContext = level + 'WithContext';

        Logger.prototype[level] = function loggerFn(data, values) {
            this.write(level, data, values);
        };

        Logger[level] = function staticLoggerFn(data, values) {
            Logger[levelWithContext](ROOT_LOGCONTEXT, data, values);
        };

        Logger[levelWithContext] = function staticLoggerFnWithContext(logContext, data, values, options) {
            Logger.get(logContext, options)[level](data, values);
        };
    });

    return Logger;
});
