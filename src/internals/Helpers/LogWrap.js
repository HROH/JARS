JARS.internal('Helpers/LogWrap', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        BUNDLE_LOG_CONTEXT_PREFIX = 'Bundle:',
        MODULE_LOG_CONTEXT_PREFIX = 'Module:';

    /**
     * @class
     *
     * @memberof JARS~internals.Helpers
     *
     * @param {string} loggerContext
     */
    function LogWrap(loggerContext) {
        this._context = loggerContext;
    }

    /**
     * @param {JARS~internals.Bundle} bundle
     *
     * @return {JARS~internals.Helpers.LogWrap}
     */
    LogWrap.forBundle = function(bundle) {
        return new LogWrap(BUNDLE_LOG_CONTEXT_PREFIX + bundle.name);
    };

    /**
     * @param {JARS~internals.Module} module
     *
     * @return {JARS~internals.Helpers.LogWrap}
     */
    LogWrap.forModule = function(module) {
        return new LogWrap(MODULE_LOG_CONTEXT_PREFIX + module.name);
    };

    getInternal('Helpers/Array').each(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        LogWrap.prototype[methodName] = function(message, values) {
            System.Logger && System.Logger[methodName + 'WithContext'](this._context, message, values);
        };
    });

    /**
     * @method JARS~internals.Helpers.LogWrap#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Helpers.LogWrap#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Helpers.LogWrap#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.Helpers.LogWrap#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    return LogWrap;
});
