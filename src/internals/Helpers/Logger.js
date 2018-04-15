JARS.internal('Helpers/Logger', function(getInternal) {
    'use strict';

    var DEBUG = getInternal('Configs/Options').DEBUG;

    /**
     * @class
     *
     * @memberof JARS~internals.Helpers.Logger
     *
     * @param {string} description
     * @param {JARS~internals.Configs.Subject} config
     * @param {JARS~internals.States.Subject} loggerState
     * @param {JARS~internals.Refs.Subject} loggerRef
     */
    function Subject(description, config, loggerState, loggerRef) {
        this._context = description;
        this._config = config;
        this._loggerState = loggerState;
        this._loggerRef = loggerRef;
    }

    /**
     * @param {string} level
     * @param {string} message
     * @param {Object} [values]
     */
    Subject.prototype.write = function(level, message, values) {
        this._config.get(DEBUG) && this._loggerState.isLoaded() && this._loggerRef.get()[level + 'WithContext'](this._context, message, values);
    };

    getInternal('Helpers/Array').each(['debug', 'error', 'info', 'warn'], function(level) {
        Subject.prototype[level] = function(message, values) {
            this.write(level, message, values);
        };
    });

    /**
     * @method JARS~internals.Helpers.Logger#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Helpers.Logger#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Helpers.Logger#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Helpers.Logger#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    return Subject;
});
