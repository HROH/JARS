JARS.internal('ModuleLogger', function moduleLoggerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Resolver = getInternal('Resolver'),
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
        this._loggerContext = (Resolver.isBundle(moduleOrBundleName) ? 'Bundle' : 'Module') + ':' + moduleOrBundleName;
    }

    getInternal('utils').arrayEach(['debug', 'error', 'info', 'warn'], function addForward(methodName) {
        ModuleLogger.prototype[methodName] = function(message, values) {
            log(this, methodName, message, values);
        };
    });

    /**
     * @method debug
     *
     * @memberof JARS.internals.ModuleLogger#
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method error
     *
     * @memberof JARS.internals.ModuleLogger#
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method info
     *
     * @memberof JARS.internals.ModuleLogger#
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @method warn
     *
     * @memberof JARS.internals.ModuleLogger#
     *
     * @param {string} message
     * @param {Object} [values]
     */

    /**
     * @private
     *
     * @memberof JARS.internals.ModuleLogger
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
