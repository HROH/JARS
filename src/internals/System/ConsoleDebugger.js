JARS.module('System.ConsoleDebugger').$export(function() {
    'use strict';

    var System = this,
        globalConsole = System.env.global.console,
        canUseGroups = globalConsole && globalConsole.group && globalConsole.groupEnd;

    function ConsoleDebugger(config, definedLevels) {
        var pseudoConsole = {},
            lastLogContext;

        System.$$internals.get('Utils').arrayEach(definedLevels, function createConsoleForward(methodName) {
            pseudoConsole[methodName] = globalConsole ? forwardConsole(globalConsole[methodName] ? methodName : definedLevels[0]) : noop;
        });

        function noop() {}

        function forwardConsole(methodName) {
            return function log(logContext, data) {
                var throwError = methodName === 'error' && config('throwError'),
                    metainfo = [];

                config('timestamp') && metainfo.push('[' + data.timestamp + ']');

                if (!(canUseGroups && config('groupByContext')) || throwError) {
                    metainfo.push('[' + logContext + ']');

                    if (throwError) {
                        throw new Error(metainfo.join(' ') + ' -> ' + data.message);
                    }
                }
                else {
                    lastLogContext = updateGroup(lastLogContext, logContext);
                }

                globalConsole[methodName](metainfo.join(' '), data.message, config('meta') ? data.meta : '');
            };
        }

        return pseudoConsole;
    }

    function updateGroup(lastLogContext, logContext) {
        if (lastLogContext !== logContext) {
            lastLogContext && globalConsole.groupEnd(lastLogContext);

            globalConsole.group(logContext);

            lastLogContext = logContext;
        }

        return lastLogContext;
    }

    return ConsoleDebugger;
});
