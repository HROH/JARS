JARS.internal('Logger', function loggerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        BundleResolver = getInternal('BundleResolver'),
        System = getInternal('System');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {string} moduleOrBundleName
     */
    function Logger(moduleOrBundleName) {
        this._moduleOrBundleName = moduleOrBundleName;
        this._loggerContext = (BundleResolver.isBundle(moduleOrBundleName) ? 'Bundle' : 'Module') + ':' + moduleOrBundleName;
    }

    getInternal('Utils').arrayEach(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        Logger.prototype[methodName] = function(message, values) {
            log(this, methodName, message, values);
        };
    });

    /**
     * @method JARS.internals.Logger#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.Logger#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.Logger#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.Logger#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @memberof JARS.internals.Logger
     * @inner
     *
     * @param {JARS.internals.Logger} logger
     * @param {string} logMethod
     * @param {string} message
     * @param {Object} [values]
     */
    function log(logger, logMethod, message, values) {
        var SystemLogger = System.Logger;

        if (SystemLogger) {
            SystemLogger[logMethod + 'WithContext'](logger._loggerContext, message, values);
        }
    }

    return Logger;
});
