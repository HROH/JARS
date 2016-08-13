JARS.module('System.Logger').$import([
    '.!',
    '.::isArray',
    '.::isFunction',
    '.::isNumber',
    '.::isObject',
    '.::isString',
    '.::format',
    '.Modules::getCurrentModuleData'
]).$export(function(config, isArray, isFunction, isNumber, isObject, isString, format, getCurrentModuleData) {
    'use strict';

    var internals = this.$$internals,
        utils = internals.get('utils'),
        hasOwnProp = utils.hasOwnProp,
        arrayEach = utils.arrayEach,
        envGlobal = utils.global,
        Loader = internals.get('Loader'),
        Resolver = internals.get('Resolver'),
        debuggers = {},
        loggerCache = {},
        stdLevels = 'log debug info warn error'.split(' '),
        ROOT_LOGCONTEXT = getCurrentModuleData().moduleName;

    /**
     * @access private
     *
     * @memberof System.Logger
     * @inner
     *
     * @param {(String|Number)} levelOrPriority
     *
     * @return {Number}
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
     * @access private
     *
     * @memberof System.Logger
     * @inner
     *
     * @param {Boolean} debug
     * @param {String} level
     * @param {String} context
     *
     * @return {Boolean}
     */
    function isDebuggingEnabled(debug, level, context) {
        return debug && comparePriority(level) && compareDebugContext(context);
    }

    /**
     * @access private
     *
     * @memberof System.Logger
     * @inner
     *
     * @param {String} level
     *
     * @return {Boolean}
     */
    function comparePriority(level) {
        return getPriority(level) >= getPriority(config.level);
    }

    /**
     * @access private
     *
     * @memberof System.Logger
     * @inner
     *
     * @param {String} context
     *
     * @return {Boolean}
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
     * @access private
     *
     * @memberof System.Logger
     * @inner
     *
     * @param {String} context
     * @param {(String[]|String)} contextList
     *
     * @return {Boolean}
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
     * @access private
     *
     * @memberof System.Logger
     * @inner
     *
     * @param {String} mode
     *
     * @return {Object}
     */
    function getActiveDebugger(mode) {
        return debuggers[mode] || debuggers.console;
    }

    /**
     * @access public
     *
     * @memberof System
     *
     * @class Logger
     *
     * @param {String} logContext
     * @param {Object} options
     */
    function Logger(logContext, options) {
        var logger = this;

        logger.context = logContext || 'Default';
        loggerCache[logContext] = logger;

        logger.options = options || {};
        logger.options.tpl = logger.options.tpl || {};
    }

    /**
     * @access private
     *
     * @memberof System.Logger#
     *
     * @param {String} level
     * @param {*} message
     * @param {(Object|Array)} values
     */
    Logger.prototype._out = function(level, message, values) {
        var logger = this,
            context = logger.context,
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
    };
    /**
     * @access public
     *
     * @memberof System.Logger
     *
     * @type {Object<string, number>}
     */
    Logger.logLevels = {
        ALL: -Infinity
    };

    /**
     * @access public
     *
     * @memberof System.Logger
     *
     * @param {String} level
     * @param {Number} priority
     */
    Logger.addLogLevel = function(level, priority) {
        var levelConst = level.toUpperCase();

        if (!hasOwnProp(Logger.logLevels, levelConst)) {
            Logger.logLevels[levelConst] = isNumber(priority) ? priority : Logger.logLevels.ALL;

            Logger.prototype[level] = function loggerFn(data, values) {
                this._out(level, data, values);
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
     * @access public
     *
     * @memberof System.Logger
     *
     * @param {Object} options
     *
     * @return {System.Logger}
     */
    Logger.forCurrentModule = function(options) {
        var logContext = Loader.getCurrentModuleData().moduleName;

        Resolver.isRootName(logContext) && (logContext = ROOT_LOGCONTEXT);

        return loggerCache[logContext] || new Logger(logContext, options);
    };

    /**
     * @access public
     *
     * @memberof System.Logger
     *
     * @param {Object} pluginRequest
     */
    Logger.$plugIn = function(pluginRequest) {
        var data = pluginRequest.data.split(':');

        pluginRequest.$importAndLink(data[1], function(Debugger) {
            Logger.addDebugger(data[0], Debugger.setup);

            pluginRequest.success(Logger);
        }, function(abortedModuleName) {
            pluginRequest.fail(abortedModuleName);
        });
    };

    /**
     * @access public
     *
     * @memberof System.Logger
     *
     * @param {String} mode
     * @param {Function()} debuggerSetup
     */
    Logger.addDebugger = function(mode, debuggerSetup) {
        var modeConfig = mode + 'Config';

        if (!hasOwnProp(debuggers, mode) && isFunction(debuggerSetup)) {
            debuggers[mode] = debuggerSetup(function debuggerConfigGetter(option) {
                return (config[modeConfig] || {})[option];
            });
        }
    };

    arrayEach(stdLevels, function addLogLevel(stdLevel, levelIndex) {
        Logger.addLogLevel(stdLevel, (levelIndex + 1) * 10);
    });

    Logger.addDebugger('console', function consoleDebuggerSetup(config) {
        var console = envGlobal.console,
            canUseGroups = console && console.group && console.groupEnd,
            pseudoConsole = {},
            method, lastLogContext;

        arrayEach(stdLevels, function createConsoleForward(stdLevel) {
            method = stdLevel;
            pseudoConsole[method] = console ? forwardConsole(console[method] ? method : stdLevels[0]) : noop;
        });

        function noop() {}

        function forwardConsole(method) {
            return function log(logContext, data) {
                var throwError = method === 'error' && config('throwError'),
                    metainfo = [];

                config('timestamp') && metainfo.push('[' + data.timestamp + ']');

                if (!(canUseGroups && config('groupByContext')) || throwError) {
                    metainfo.push('[' + logContext + ']');

                    if (throwError) {
                        throw new Error(metainfo.join(' ') + ' -> ' + data.message);
                    }
                }
                else if (lastLogContext !== logContext) {
                    lastLogContext && envGlobal.console.groupEnd(lastLogContext);

                    envGlobal.console.group(logContext);

                    lastLogContext = logContext;
                }

                envGlobal.console[method](metainfo.join(' '), data.message, config('meta') ? data.meta : '');
            };
        }

        return pseudoConsole;
    });

    return Logger;
});
