/**
 * @module System.Logger
 * @see JARS~internals.System.Logger
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
     * @memberof JARS~internals.System.Logger
     * @inner
     *
     * @param {object} options
     * @param {string} level
     * @param {string} context
     *
     * @return {boolean}
     */
    function isDebuggingEnabled(options, level, context) {
        return getOption(options, 'debug') && LogLevels.comparePriority(level, getOption(options, 'level')) && LogContext.isCurrent(context);
    }

    /**
     * @memberof JARS~internals.System.Logger
     * @inner
     *
     * @param {object} options
     * @param {string} option
     *
     * @return {*}
     */
    function getOption(options, option) {
        return options[option] || config[option];
    }

    /**
     * @class
     *
     * @memberof JARS~internals.System
     *
     * @param {string} logContext
     * @param {object} options
     */
    function Logger(logContext, options) {
        var logger = this;

        logger.context = logContext;
        logger.options = options || {};
    }

    /**
     * @param {string} logContext
     * @param {object} options
     *
     * @return {JARS~internals.System.Logger}
     */
    Logger.get = function(logContext, options) {
        return loggerCache[logContext] || (loggerCache[logContext] = new Logger(logContext, options));
    };

    /**
     * @param {object} options
     *
     * @return {JARS~internals.System.Logger}
     */
    Logger.forCurrentModule = function(options) {
        return Logger.get(getCurrentModuleData().moduleName, options);
    };

    /**
     * @param {string} level
     * @param {*} message
     * @param {(object|array)} values
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
