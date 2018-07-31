JARS.internal('Logger/Levels', function(getInternal) {
    'use strict';

    var Validators = getInternal('Types/Validators'),
        each = getInternal('Helpers/Array').each,
        hasOwnProp = getInternal('Helpers/Object').hasOwnProp,
        DEFAULT_LOGLEVELS = ['log', 'debug', 'info', 'warn', 'error'],
        definedLevels = [],
        priorityMap = {},
        Levels;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Logger
     */
    Levels = {
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
         * @param {JARS~internals.Helpers.Array~Callback} callback
         */
        each: function(callback) {
            each(definedLevels, callback);
        },
        /**
         * @param {string} level
         *
         * @return {number}
         */
        getPriority: function(level) {
            return hasLevelPriority(level) ? getLevelPriority(level) : Levels.ALL;
        },
        /**
         * @param {string} level
         * @param {string} requiredLevel
         *
         * @return {boolean}
         */
        comparePriority: function(level, requiredLevel) {
            return Levels.getPriority(level) >= Levels.getPriority(requiredLevel);
        },
        /**
         * @param {number} priority
         *
         * @return {string}
         */
        getLevel: function(priority) {
            return priorityMap[priority];
        }
    };

    each(DEFAULT_LOGLEVELS, function addLevel(stdLevel, levelIndex) {
        Levels.add(stdLevel, (levelIndex + 1) * 10);
    });

    /**
     * @memberof JARS~internals.Logger.Levels
     * @inner
     *
     * @param {string} level
     *
     * @return {boolean}
     */
    function hasLevelPriority(level) {
        return Validators.isString(level) && hasOwnProp(Levels, level.toUpperCase());
    }

    /**
     * @memberof JARS~internals.Logger.Levels
     * @inner
     *
     * @param {string} level
     *
     * @return {number}
     */
    function getLevelPriority(level) {
        return Levels[level.toUpperCase()];
    }
    /**
     * @memberof JARS~internals.Logger.Levels
     * @inner
     *
     * @param {string} level
     * @return {number}
     */
    function setLevelPriority(level, priority) {
        Levels[level.toUpperCase()] = Validators.isNumber(priority) ? priority : Levels.ALL;
        priorityMap[priority] = level;
    }

    return Levels;
});
