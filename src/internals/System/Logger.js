/**
 * @module System.Logger
 * @see JARS.internals.System.Logger
 */
JARS.module('System.Logger').$import([
    '.!',
    '.',
    '.Transports',
    '.Formatter::format',
    '.LogLevels',
    '.Modules::getCurrentModuleData'
]).$export(function systemLoggerSetup(config, System, Transports, format, LogLevels, getCurrentModuleData) {
    'use strict';

    var loggerCache = {},
        CONTEXT_DELIMITER = ',',
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
    function isDebuggingEnabled(debug, level, context) {
        return debug && comparePriority(level) && compareDebugContext(context);
    }

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {string} level
     *
     * @return {boolean}
     */
    function comparePriority(level) {
        return LogLevels.getPriority(level) >= LogLevels.getPriority(config.level);
    }

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {string} context
     *
     * @return {boolean}
     */
    function compareDebugContext(context) {
        var debugContext = config.context;

        if (!System.isObject(debugContext)) {
            debugContext = {
                include: debugContext
            };
        }

        return !inContextList(context, debugContext.exclude) && (inContextList(context, debugContext.include) || !debugContext.include);
    }

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {string} context
     * @param {(string[]|string)} contextList
     *
     * @return {boolean}
     */
    function inContextList(context, contextList) {
        if(System.isString(contextList)) {
            contextList = contextList.split(CONTEXT_DELIMITER);
        }

        return System.isArray(contextList) && contextList.indexOf(context) > -1;
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

        logContext = logContext || ROOT_LOGCONTEXT;
        loggerCache[logContext] = logger;
        logger.context = logContext;
        logger.options = options || {};
        logger.options.tpl = logger.options.tpl || {};
    }

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {JARS.internals.System.Logger} logger
     * @param {string} level
     * @param {*} message
     * @param {(Object|Array)} values
     */
    function output(logger, level, message, values) {
        var context = logger.context,
            options = logger.options,
            activeTransport = Transports.getActive(getOption(options, 'mode')),
            methodName = activeTransport[level] ? level : 'log';

        if (isDebuggingEnabled(getOption(options, 'debug'), level, context) && System.isFunction(activeTransport[methodName])) {
            message = format(options.tpl[message] || message, values);

            activeTransport[methodName](context, {
                timestamp: new Date().toUTCString(),

                message: message,

                meta: values
            });
        }
    }

    function getOption(options, option) {
        return options[option] || config[option];
    }

    Logger.get = function(logContext, options) {
        return loggerCache[logContext] || new Logger(logContext, options);
    };

    /**
     * @param {Object} options
     *
     * @return {JARS.internals.System.Logger}
     */
    Logger.forCurrentModule = function(options) {
        return Logger.get(getCurrentModuleData().moduleName, options);
    };

    LogLevels.each(function addLoggerMethod(level) {
        var levelWithContext = level + 'WithContext';

        Logger.prototype[level] = function loggerFn(data, values) {
            output(this, level, data, values);
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
