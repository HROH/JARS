JARS.internal('LogWrap', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        BUNDLE_LOG_CONTEXT_PREFIX = 'Bundle:',
        MODULE_LOG_CONTEXT_PREFIX = 'Module:';

    /**
     * @class
     *
     * @memberof JARS~internals
     *
     * @param {string} loggerContext
     */
    function LogWrap(loggerContext) {
        this._context = loggerContext;
    }

    /**
     * @param {JARS~internals.Bundle} bundle
     *
     * @return {JARS~internals.LogWrap}
     */
    LogWrap.forBundle = function(bundle) {
        return new LogWrap(BUNDLE_LOG_CONTEXT_PREFIX + bundle.name);
    };

    /**
     * @param {JARS~internals.Module} module
     *
     * @return {JARS~internals.LogWrap}
     */
    LogWrap.forModule = function(module) {
        return new LogWrap(MODULE_LOG_CONTEXT_PREFIX + module.name);
    };

    getInternal('Utils').arrayEach(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        LogWrap.prototype[methodName] = function(message, values) {
            System.Logger && System.Logger[methodName + 'WithContext'](this._context, message, values);
        };
    });

    /**
     * @method JARS~internals.LogWrap#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.LogWrap#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.LogWrap#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS~internals.LogWrap#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    return LogWrap;
});
