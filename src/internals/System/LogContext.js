JARS.module('System.LogContext').$import(['.!', '.']).$export(function(config, System) {
    'use strict';

    var CONTEXT_DELIMITER = ',',
        LogContext;

    LogContext = {
        isCurrent: function(context) {
            var currentContext = getCurrentContext();

            return !isExcluded(context, currentContext.exclude) && isIncluded(context, currentContext.include);
        }
    };

    function getCurrentContext() {
        var currentContext = config.context;

        if (!System.isObject(currentContext)) {
            currentContext = {
                include: currentContext
            };
        }

        currentContext = {
            include: getContextList(currentContext.include),

            exclude: getContextList(currentContext.exclude)
        };

        return currentContext;
    }

    function getContextList(contextList) {
        return System.isString(contextList) ? contextList.split(CONTEXT_DELIMITER) : System.isArray(contextList) ? contextList : [];
    }

    function isIncluded(context, includeList) {
        return !includeList.length || inContextList(context, includeList);
    }

    function isExcluded(context, excludeList) {
        return inContextList(context, excludeList);
    }

    /**
     * @memberof JARS.internals.System.LogContext
     * @inner
     *
     * @param {string} context
     * @param {string[]} contextList
     *
     * @return {boolean}
     */
    function inContextList(context, contextList) {
        return contextList.indexOf(context) > -1;
    }

    return LogContext;
});
