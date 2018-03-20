/**
 * @module Console
 */
JARS.module('System.Transports.Console').$import(['..Modules!', '..::env', '..LogLevels']).$export(function(config, env, LogLevels) {
    'use strict';

    var globalConsole = env.global.console || {},
        lastGroup;

    /**
     * @class
     *
     * @memberof module:Transports
     *
     * @alias module:Console
     */
    function Console() {}

    /**
     * @param {string} level
     * @param {string} context
     * @param {object} data
     */
    Console.prototype.write = function(level, context, data) {
        var message = getMessage(level, context, data),
            meta = getIfConfigured(data, 'meta');

        updateGroup(context);

        if (shouldThrowError(level)) {
            throw new Error(message);
        }

        meta ? globalConsole[level](message, meta) : globalConsole[level](message);
    };

    LogLevels.each(function createConsoleForward(level) {
        Console.prototype[level] = function(context, data) {
            this.write(level, context, data);
        };
    });

    /**
     * @memberof module:Console
     * @inner
     *
     * @param {string} nextGroup
     */
    function updateGroup(nextGroup) {
        if (shouldGroupByContext() && lastGroup !== nextGroup) {
            lastGroup && globalConsole.groupEnd(lastGroup);
            globalConsole.group(nextGroup);
            lastGroup = nextGroup;
        }
    }

    /**
     * @memberof module:Console
     * @inner
     *
     * @param {string} level
     *
     * @return {boolean}
     */
    function shouldThrowError(level) {
        return config.throwError && LogLevels.comparePriority(level, 'error');
    }

    /**
     * @memberof module:Console
     * @inner
     *
     * @return {boolean}
     */
    function shouldGroupByContext() {
        return config.groupByContext && globalConsole.group && globalConsole.groupEnd;
    }

    /**
     * @memberof module:Console
     * @inner
     *
     * @param {string} level
     * @param {string} context
     * @param {object} data
     *
     * @return {string}
     */
    function getMessage(level, context, data) {
        return brackets(getIfConfigured(data, 'timestamp')) + brackets(getContext(level, context)) + ' ' + data.message;
    }

    /**
     * @memberof module:Console
     * @inner
     *
     * @param {string} level
     * @param {string} context
     *
     * @return {string}
     */
    function getContext(level, context) {
        return (shouldThrowError(level) || !shouldGroupByContext()) && context;
    }

    /**
     * @memberof module:Console
     * @inner
     *
     * @param {object} data
     * @param {string} key
     *
     * @return {string}
     */
    function getIfConfigured(data, key) {
        return config[key] ? data[key] : '';
    }

    /**
     * @memberof module:Console
     * @inner
     *
     * @param {string} string
     *
     * @return {string}
     */
    function brackets(string) {
        return string ? '[' + string + ']' : '';
    }

    this.add('console', new Console());

    return Console;
});
