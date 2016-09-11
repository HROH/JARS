JARS.internal('ModuleLogger', function moduleLoggerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Resolver = getInternal('Resolver'),
        System = getInternal('System');

    /**
     * @access public
     *
     * @constructor ModuleLogger
     *
     * @memberof JARS
     * @inner
     *
     * @param {String} moduleOrBundleName
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
     * @access public
     *
     * @method debug
     *
     * @memberof JARS~ModuleLogger#
     *
     * @param {String} message
     * @param {Object} [values]
     */

    /**
     * @access public
     *
     * @method error
     *
     * @memberof JARS~ModuleLogger#
     *
     * @param {String} message
     * @param {Object} [values]
     */

    /**
     * @access public
     *
     * @method info
     *
     * @memberof JARS~ModuleLogger#
     *
     * @param {String} message
     * @param {Object} [values]
     */

    /**
     * @access public
     *
     * @method warn
     *
     * @memberof JARS~ModuleLogger#
     *
     * @param {String} message
     * @param {Object} [values]
     */

    /**
     * @access private
     *
     * @memberof JARS~ModuleLogger
     *
     * @param {JARS~ModuleLogger} logger
     * @param {String} logMethod
     * @param {String} message
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
