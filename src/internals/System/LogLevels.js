JARS.module('System.LogLevels').$import(['.::$$internals', '.::isNumber', '.::isString']).$export(function(internals, isNumber, isString) {
    'use strict';

    var Utils = internals.get('Utils'),
        arrayEach = Utils.arrayEach,
        hasOwnProp = Utils.hasOwnProp,
        DEFAULT_LOGLEVELS = 'log debug info warn error'.split(' '),
        definedLevels = [],
        LogLevels;

    LogLevels = {
        ALL: -Infinity,

        add: function(level, priority) {
            if (!hasLevel(level)) {
                definedLevels.push(level);

                setLevel(level, priority);
            }
        },

        each: function(callback) {
            arrayEach(definedLevels, callback);
        },
        /**
         * @param {string} levelOrPriority
         *
         * @return {number}
         */
        getPriority: function(level) {
            return hasLevel(level) ? getLevel(level) : LogLevels.ALL;
        }
    };

    arrayEach(DEFAULT_LOGLEVELS, function addLevel(stdLevel, levelIndex) {
        LogLevels.add(stdLevel, (levelIndex + 1) * 10);
    });

    function hasLevel(level) {
        return isString(level) && hasOwnProp(LogLevels, level.toUpperCase());
    }

    function getLevel(level) {
        return LogLevels[level.toUpperCase()];
    }

    function setLevel(level, priority) {
        LogLevels[level.toUpperCase()] = isNumber(priority) ? priority : LogLevels.ALL;
    }

    return LogLevels;
});
