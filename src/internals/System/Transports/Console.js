JARS.module('System.Transports.Console').$import(['..!', '..::env', '..LogLevels']).$export(function(config, env, LogLevels) {
    'use strict';

    var globalConsole = env.global.console || {},
        lastGroup;

    function ConsoleTransport() {

    }

    ConsoleTransport.prototype.write = function(level, context, data) {
        var info = getInfo(level, context, data);

        updateGroup(context);

        if (shouldThrowError(level)) {
            throw new Error(info + ' -> ' + data.message);
        }

        globalConsole[level](info, data.message, getData(data, 'meta'));
    };

    LogLevels.each(function createConsoleForward(level) {
        ConsoleTransport.prototype[level] = function(context, data) {
            this.write(level, context, data);
        };
    });

    function updateGroup(nextGroup) {
        if (shouldGroupByContext() && lastGroup !== nextGroup) {
            lastGroup && globalConsole.groupEnd(lastGroup);
            globalConsole.group(nextGroup);
            lastGroup = nextGroup;
        }
    }

    function shouldThrowError(level) {
        return config.throwError && LogLevels.comparePriority(level, 'error');
    }

    function shouldGroupByContext() {
        return config.groupByContext && globalConsole.group && globalConsole.groupEnd;
    }

    function getInfo(level, context, data) {
        return brackets(getData(data, 'timestamp')) + brackets(getContext(level, context));
    }

    function getContext(level, context) {
        return (shouldThrowError(level) || !shouldGroupByContext()) && context;
    }

    function getData(data, key) {
        return config[key] ? data[key] : '';
    }

    function brackets(string) {
        return string ? '[' + string + ']' : '';
    }

    this.add('console', new ConsoleTransport());

    return ConsoleTransport;
});
