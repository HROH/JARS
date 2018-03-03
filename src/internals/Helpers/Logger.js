JARS.internal('Helpers/Logger', function(getInternal) {
    'use strict';

    var loggerRef;

    /**
     * @class
     *
     * @memberof JARS~internals.Helpers.Logger
     *
     * @param {string} description
     * @param {JARS~internals.Configs.Subject} config
     */
    function Subject(description, config) {
        this._config = config;
        this._context = description;
    }

    getInternal('Helpers/Array').each(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        Subject.prototype[methodName] = function(message, values) {
            var loggerRef = getLoggerRef();

            this._config.get('debug') && loggerRef && loggerRef.get()[methodName + 'WithContext'](this._context, message, values);
        };
    });

    /**
     * @memberof JARS~internals.Helpers.Logger
     * @inner
     *
     * @return {JARS~internals.Refs.Module}
     */
    function getLoggerRef() {
        return loggerRef || (loggerRef = getInternal('Registries/Subjects').get('System.Logger').ref);
    }

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
