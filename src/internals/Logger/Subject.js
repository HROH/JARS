JARS.internal('Logger/Subject', function(getInternal) {
    'use strict';

    var getModule = getInternal('Registries/Modules').get;

    /**
     * @class
     *
     * @memberof JARS~internals.Logger
     *
     * @param {string} loggerContext
     */
    function Subject(loggerContext) {
        this._context = loggerContext;
    }

    getInternal('Helpers/Array').each(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        Subject.prototype[methodName] = function(message, values) {
            var loggerRef = getModule('System.Logger').ref;

            loggerRef && loggerRef.get()[methodName + 'WithContext'](this._context, message, values);
        };
    });

    /**
     * @method JARS~internals.Logger.Subject#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Logger.Subject#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Logger.Subject#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Logger.Subject#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    return Subject;
});
