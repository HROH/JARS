/**
 * @module LogContext
 */
JARS.module('System.LogContext').$import(['.Modules!', '.']).$export(function(config, System) {
    'use strict';

    var CONTEXT_DELIMITER = ',',
        LogContext;

    /**
     * @namespace
     *
     * @memberof module:System
     *
     * @alias module:LogContext
     */
    LogContext = {
        /**
         * @param {string} context
         *
         * @return {boolean}
         */
        isCurrent: function(context) {
            var currentContext = getCurrentContext();

            return !isExcluded(context, currentContext.exclude) && isIncluded(context, currentContext.include);
        }
    };

    /**
     * @memberof module:LogContext
     * @inner
     *
     * @return {string}
     */
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

    /**
     * @memberof module:LogContext
     * @inner
     *
     * @param {(string|string[])} contextList
     *
     * @return {string[]}
     */
    function getContextList(contextList) {
        return System.isString(contextList) ? contextList.split(CONTEXT_DELIMITER) : System.isArray(contextList) ? contextList : [];
    }

    /**
     * @memberof module:LogContext
     * @inner
     *
     * @param {string} context
     * @param {string[]} includeList
     *
     * @return {boolean}
     */
    function isIncluded(context, includeList) {
        return !includeList.length || inContextList(context, includeList);
    }

    /**
     * @memberof module:LogContext
     * @inner
     *
     * @param {string} context
     * @param {string[]} excludeList
     *
     * @return {boolean}
     */
    function isExcluded(context, excludeList) {
        return inContextList(context, excludeList);
    }

    /**
     * @memberof module:LogContext
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
