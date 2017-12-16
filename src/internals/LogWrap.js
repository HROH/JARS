JARS.internal('LogWrap', function logWrapSetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        BUNDLE_LOG_CONTEXT_PREFIX = 'Bundle:',
        MODULE_LOG_CONTEXT_PREFIX = 'Module:';

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {string} loggerContext
     */
    function LogWrap(loggerContext) {
        this._context = loggerContext;
    }

    LogWrap.forBundle = function(bundle) {
        return new LogWrap(BUNDLE_LOG_CONTEXT_PREFIX + bundle.name);
    };

    LogWrap.forModule = function(module) {
        return new LogWrap(MODULE_LOG_CONTEXT_PREFIX + module.name);
    };

    getInternal('Utils').arrayEach(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        LogWrap.prototype[methodName] = function(message, values) {
            var SystemLogger = System.Logger;

            if (SystemLogger) {
                SystemLogger[methodName + 'WithContext'](this._context, message, values);
            }
        };
    });

    /**
     * @method JARS.internals.LogWrap#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.LogWrap#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.LogWrap#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.LogWrap#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    return LogWrap;
});
