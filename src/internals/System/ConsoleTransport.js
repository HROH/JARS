JARS.module('System.ConsoleTransport').$import('.::env').$export(function(env) {
    'use strict';

    var globalConsole = env.global.console,
        canUseGroups = globalConsole && globalConsole.group && globalConsole.groupEnd,
        CONFIG_GROUP_BY_CONTEXT = 'groupByContext',
        CONFIG_META = 'meta',
        CONFIG_THROW_ERROR = 'throwError',
        CONFIG_TIMESTAMP = 'timestamp',
        META_START = '[',
        META_MIDDLE = ' ',
        META_END = ']';

    function ConsoleTransport(config, LogLevels) {
        var pseudoConsole = {},
            lastLogContext,
            defaultLevel;

        LogLevels.each(function createConsoleForward(level) {
            defaultLevel = defaultLevel || level;
            pseudoConsole[level] = globalConsole ? forwardConsole(level, defaultLevel) : noop;
        });

        function forwardConsole(level, defaultLevel) {
            var methodName = globalConsole[level] ? level : defaultLevel,
                isError = LogLevels.getPriority(level) >= LogLevels.ERROR;

            return function log(logContext, data) {
                var throwError = isError && config(CONFIG_THROW_ERROR),
                    metaInfo = [];

                config(CONFIG_TIMESTAMP) && addMeta(metaInfo, data.timestamp);

                if(canUseGroups && config(CONFIG_GROUP_BY_CONTEXT) && !throwError) {
                    lastLogContext = updateGroup(lastLogContext, logContext);
                }
                else {
                    addMeta(metaInfo, logContext);

                    if (throwError) {
                        throw new Error(metaInfo.join(META_MIDDLE) + ' -> ' + data.message);
                    }
                }

                globalConsole[methodName](metaInfo.join(META_MIDDLE), data.message, config(CONFIG_META) ? data.meta : '');
            };
        }

        return pseudoConsole;
    }

    function addMeta(metaInfo, meta) {
        metaInfo.push(META_START + meta + META_END);
    }

    function noop() {}

    function updateGroup(lastLogContext, logContext) {
        if (lastLogContext !== logContext) {
            lastLogContext && globalConsole.groupEnd(lastLogContext);

            globalConsole.group(logContext);

            lastLogContext = logContext;
        }

        return lastLogContext;
    }

    return ConsoleTransport;
});
