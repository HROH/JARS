JARS.internal('Logger/Subject', function(getInternal) {
    'use strict';

    var System = getInternal('System');

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
            System.Logger && System.Logger[methodName + 'WithContext'](this._context, message, values);
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
