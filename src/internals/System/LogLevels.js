/**
 * @module System.LogLevels
 * @see JARS~internals.System.LogLevels
 */
JARS.module('System.LogLevels').$import(['.::$$internals', '.::isNumber', '.::isString']).$export(function(internals, isNumber, isString) {
    'use strict';

    var Utils = internals.get('Utils'),
        arrayEach = Utils.arrayEach,
        hasOwnProp = Utils.hasOwnProp,
        DEFAULT_LOGLEVELS = 'log debug info warn error'.split(' '),
        definedLevels = [],
        LogLevels;

    /**
     * @namespace
     *
     * @memberof JARS~internals.System
     */
    LogLevels = {
        /**
         * @type {number}
         */
        ALL: -Infinity,
        /**
         * @param {string} level
         * @param {number} priority
         */
        add: function(level, priority) {
            if (!hasLevelPriority(level)) {
                definedLevels.push(level);

                setLevelPriority(level, priority);
            }
        },
        /**
         * @param {function()} callback
         */
        each: function(callback) {
            arrayEach(definedLevels, callback);
        },
        /**
         * @param {string} level
         *
         * @return {number}
         */
        getPriority: function(level) {
            return hasLevelPriority(level) ? getLevelPriority(level) : LogLevels.ALL;
        },
        /**
         * @param {string} level
         * @param {string} requiredLevel
         *
         * @return {boolean}
         */
        comparePriority: function(level, requiredLevel) {
            return LogLevels.getPriority(level) >= LogLevels.getPriority(requiredLevel);
        }
    };

    arrayEach(DEFAULT_LOGLEVELS, function addLevel(stdLevel, levelIndex) {
        LogLevels.add(stdLevel, (levelIndex + 1) * 10);
    });

    /**
     * @memberof JARS~internals.LogLevels
     * @inner
     *
     * @param {string} level
     *
     * @return {boolean}
     */
    function hasLevelPriority(level) {
        return isString(level) && hasOwnProp(LogLevels, level.toUpperCase());
    }

    /**
     * @memberof JARS~internals.LogLevels
     * @inner
     *
     * @param {string} level
     *
     * @return {number}
     */
    function getLevelPriority(level) {
        return LogLevels[level.toUpperCase()];
    }
    /**
     * @memberof JARS~internals.LogLevels
     * @inner
     *
     * @param {string} level
     * @return {number} priority
     */
    function setLevelPriority(level, priority) {
        LogLevels[level.toUpperCase()] = isNumber(priority) ? priority : LogLevels.ALL;
    }

    return LogLevels;
});
