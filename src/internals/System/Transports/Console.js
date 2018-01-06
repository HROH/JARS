/**
 * @module System.Transports.Console
 * @see JARS~internals.System.Transports.Console
 */
JARS.module('System.Transports.Console').$import(['..!', '..::env', '..LogLevels']).$export(function(config, env, LogLevels) {
    'use strict';

    var globalConsole = env.global.console || {},
        lastGroup;

    /**
     * @class
     *
     * @memberof JARS~internals.System.Transports
     */
    function Console() {

    }

    /**
     * @param {string} level
     * @param {string} context
     * @param {object} data
     */
    Console.prototype.write = function(level, context, data) {
        var info = getInfo(level, context, data);

        updateGroup(context);

        if (shouldThrowError(level)) {
            throw new Error(info + ' -> ' + data.message);
        }

        globalConsole[level](info, data.message, getData(data, 'meta'));
    };

    LogLevels.each(function createConsoleForward(level) {
        Console.prototype[level] = function(context, data) {
            this.write(level, context, data);
        };
    });

    /**
     * @memberof JARS~internals.System.Transports.Console
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
     * @memberof JARS~internals.System.Transports.Console
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
     * @memberof JARS~internals.System.Transports.Console
     * @inner
     *
     * @return {boolean}
     */
    function shouldGroupByContext() {
        return config.groupByContext && globalConsole.group && globalConsole.groupEnd;
    }

    /**
     * @memberof JARS~internals.System.Transports.Console
     * @inner
     *
     * @param {string} level
     * @param {string} context
     * @param {object} data
     *
     * @return {string}
     */
    function getInfo(level, context, data) {
        return brackets(getData(data, 'timestamp')) + brackets(getContext(level, context));
    }

    /**
     * @memberof JARS~internals.System.Transports.Console
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
     * @memberof JARS~internals.System.Transports.Console
     * @inner
     *
     * @param {object} data
     * @param {string} key
     *
     * @return {string}
     */
    function getData(data, key) {
        return config[key] ? data[key] : '';
    }

    /**
     * @memberof JARS~internals.System.Transports.Console
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
