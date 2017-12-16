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
            if (!hasLevelPriority(level)) {
                definedLevels.push(level);

                setLevelPriority(level, priority);
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
            return hasLevelPriority(level) ? getLevelPriority(level) : LogLevels.ALL;
        },

        comparePriority: function(level, requiredLevel) {
            return LogLevels.getPriority(level) >= LogLevels.getPriority(requiredLevel);
        }
    };

    arrayEach(DEFAULT_LOGLEVELS, function addLevel(stdLevel, levelIndex) {
        LogLevels.add(stdLevel, (levelIndex + 1) * 10);
    });

    function hasLevelPriority(level) {
        return isString(level) && hasOwnProp(LogLevels, level.toUpperCase());
    }

    function getLevelPriority(level) {
        return LogLevels[level.toUpperCase()];
    }

    function setLevelPriority(level, priority) {
        LogLevels[level.toUpperCase()] = isNumber(priority) ? priority : LogLevels.ALL;
    }

    return LogLevels;
});
