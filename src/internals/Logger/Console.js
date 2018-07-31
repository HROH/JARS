JARS.internal('Logger/Console', function(getInternal) {
    'use strict';

    var Levels = getInternal('Logger/Levels'),
        globalConsole = getInternal('Env').global.console || {},
        CONFIG_META = 'meta',
        CONFIG_TIMESTAMP = 'timestamp',
        lastGroup;

    /**
     * @class
     *
     * @memberof JARS~internals.Logger
     */
    function Console(config) {
        this._config = config || {};
    }

    /**
     * @param {string} level
     * @param {string} context
     * @param {object} data
     */
    Console.prototype = {
        write: function(level, context, data) {
            var message = this._getMessage(level, context, data),
                meta = this._getIfConfigured(data, CONFIG_META);

            this._updateGroup(context);

            if (this._shouldThrowError(level)) {
                throw new Error(message);
            }

            meta ? globalConsole[level](message, meta) : globalConsole[level](message);
        },
        /**
         * @param {string} nextGroup
         */
        _updateGroup: function(nextGroup) {
            if (this._shouldGroupByContext(this._config) && lastGroup !== nextGroup) {
                lastGroup && globalConsole.groupEnd(lastGroup);
                globalConsole.group(nextGroup);
                lastGroup = nextGroup;
            }
        },
        /**
         * @param {string} level
         *
         * @return {boolean}
         */
        _shouldThrowError: function(level) {
            return this._config.throwError && Levels.comparePriority(level, Levels.getLevel(Levels.ERROR));
        },
        /**
         * @return {boolean}
         */
        _shouldGroupByContext: function() {
            return this._config.groupByContext && globalConsole.group && globalConsole.groupEnd;
        },
        /**
         * @param {string} level
         * @param {string} context
         * @param {object} data
         *
         * @return {string}
         */
        _getMessage: function(level, context, data) {
            return brackets(this._getIfConfigured(data, CONFIG_TIMESTAMP)) + brackets(this._getContext(level, context)) + ' ' + data.message;
        },
        /**
         * @param {string} level
         * @param {string} context
         *
         * @return {string}
         */
        _getContext: function(level, context) {
            return (this._shouldThrowError(level) || !this._shouldGroupByContext()) && context;
        },
        /**
         * @param {object} data
         * @param {string} key
         *
         * @return {string}
         */
        _getIfConfigured: function(data, key) {
            return this._config[key] ? data[key] : '';
        }
    };

    Levels.each(function(level) {
        Console.prototype[level] = function(context, data) {
            this.write(level, context, data);
        };
    });

    /**
     * @memberof JARS~internals.Logger.Console
     * @inner
     *
     * @param {string} string
     *
     * @return {string}
     */
    function brackets(string) {
        return string ? '[' + string + ']' : '';
    }

    return Console;
});
