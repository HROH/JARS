/**
 * @module System.Logger
 * @see JARS.internals.System.Logger
 */
JARS.module('System.Logger').$import([
    '.!',
    '.::isArray',
    '.::isFunction',
    '.::isNumber',
    '.::isObject',
    '.::isString',
    '.Formatter::format',
    '.ConsoleDebugger',
    '.Modules::getCurrentModuleData'
]).$export(function systemLoggerFactory(config, isArray, isFunction, isNumber, isObject, isString, format, ConsoleDebugger, getCurrentModuleData) {
    'use strict';

    var Utils = this.$$internals.get('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        debuggers = {},
        loggerCache = {},
        definedLevels = [],
        ROOT_LOGCONTEXT = getCurrentModuleData().moduleName;

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {(string|number)} levelOrPriority
     *
     * @return {number}
     */
    function getPriority(levelOrPriority) {
        var logLevels = Logger.logLevels,
            priority = logLevels.ALL;

        if (isString(levelOrPriority) && hasOwnProp(logLevels, (levelOrPriority = levelOrPriority.toUpperCase()))) {
            priority = logLevels[levelOrPriority];
        }
        else if (isNumber(levelOrPriority)) {
            priority = levelOrPriority;
        }

        return priority;
    }

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
        return getPriority(level) >= getPriority(config.level);
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
        var debugContext = config.context,
            includeContext, excludeContext;

        if (isObject(debugContext)) {
            includeContext = debugContext.include;
            excludeContext = debugContext.exclude;
        }
        else {
            includeContext = debugContext;
        }

        return includeContext ? inContextList(context, includeContext) : excludeContext ? !inContextList(context, excludeContext) : true;
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
        var contextDelimiter = ',';

        if (isArray(contextList)) {
            contextList = contextList.join(contextDelimiter);
        }

        contextList = contextDelimiter + contextList + contextDelimiter;

        return contextList.indexOf(contextDelimiter + context + contextDelimiter) > -1;
    }

    /**
     * @memberof JARS.internals.System.Logger
     * @inner
     *
     * @param {string} mode
     *
     * @return {Object}
     */
    function getActiveDebugger(mode) {
        return debuggers[mode] || debuggers.console;
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

        logger.context = logContext || ROOT_LOGCONTEXT;
        loggerCache[logContext] = logger;

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
            currentDebugger = getActiveDebugger(options.mode || config.mode),
            debuggerMethod = currentDebugger[level] ? level : 'log';

        if (isDebuggingEnabled(options.debug || config.debug, level, context) && isFunction(currentDebugger[debuggerMethod])) {
            message = format(options.tpl[message] || message, values);

            currentDebugger[debuggerMethod](context, {
                timestamp: new Date().toUTCString(),

                message: message,

                meta: values
            });
        }
    }

    /**
     * @type {Object<string, number>}
     */
    Logger.logLevels = {
        ALL: -Infinity
    };

    /**
     * @param {string} level
     * @param {number} priority
     */
    Logger.addLogLevel = function(level, priority) {
        var levelConst = level.toUpperCase();

        if (!hasOwnProp(Logger.logLevels, levelConst)) {
            definedLevels.push(level);

            Logger.logLevels[levelConst] = isNumber(priority) ? priority : Logger.logLevels.ALL;

            Logger.prototype[level] = function loggerFn(data, values) {
                output(this, level, data, values);
            };

            Logger[level] = function staticLoggerFn(data, values) {
                Logger[level + 'WithContext'](ROOT_LOGCONTEXT, data, values);
            };

            Logger[level + 'WithContext'] = function staticLoggerFnWithContext(logContext, data, values, options) {
                (loggerCache[logContext] || new Logger(logContext, options))[level](data, values);
            };
        }
    };

    /**
     * @param {Object} options
     *
     * @return {JARS.internals.System.Logger}
     */
    Logger.forCurrentModule = function(options) {
        var logContext = getCurrentModuleData().moduleName;

        return loggerCache[logContext] || new Logger(logContext, options);
    };

    /**
     * @param {JARS.internals.Interception} pluginRequest
     */
    Logger.$plugIn = function(pluginRequest) {
        var data = pluginRequest.info.data.split(':');

        pluginRequest.$importAndLink(data[1], function addDebugger(Debugger) {
            Logger.addDebugger(data[0], Debugger.setup);

            pluginRequest.success(Logger);
        });
    };

    /**
     * @param {string} mode
     * @param {function(function(string): *, string[])} debuggerSetup
     */
    Logger.addDebugger = function(mode, debuggerSetup) {
        var modeConfig = mode + 'Config';

        if (!hasOwnProp(debuggers, mode) && isFunction(debuggerSetup)) {
            debuggers[mode] = debuggerSetup(function debuggerConfigGetter(option) {
                return (config[modeConfig] || {})[option];
            }, definedLevels);
        }
    };

    Utils.arrayEach('log debug info warn error'.split(' '), function addLogLevel(stdLevel, levelIndex) {
        Logger.addLogLevel(stdLevel, (levelIndex + 1) * 10);
    });

    Logger.addDebugger('console', ConsoleDebugger);

    return Logger;
});
