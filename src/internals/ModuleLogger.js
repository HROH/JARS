JARS.internal('ModuleLogger', function moduleLoggerSetup(InternalsManager) {
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
    function ModuleLogger(moduleOrBundleName) {
        this._moduleOrBundleName = moduleOrBundleName;
        this._loggerContext = (BundleResolver.isBundle(moduleOrBundleName) ? 'Bundle' : 'Module') + ':' + moduleOrBundleName;
    }

    getInternal('Utils').arrayEach(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        ModuleLogger.prototype[methodName] = function(message, values) {
            log(this, methodName, message, values);
        };
    });

    /**
     * @method JARS.internals.ModuleLogger#debug
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.ModuleLogger#error
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.ModuleLogger#info
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method JARS.internals.ModuleLogger#warn
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @memberof JARS.internals.ModuleLogger
     * @inner
     *
     * @param {JARS.internals.ModuleLogger} logger
     * @param {string} logMethod
     * @param {string} message
     * @param {Object} [values]
     */
    function log(logger, logMethod, message, values) {
        var Logger = System.Logger;

        if (Logger) {
            Logger[logMethod + 'WithContext'](logger._loggerContext, message, values);
        }
    }

    return ModuleLogger;
});
