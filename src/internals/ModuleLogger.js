JARS.internal('ModuleLogger', function moduleLoggerSetup() {
    'use strict';

    function ModuleLogger(module) {
        this._module = module;
    }

    ModuleLogger.prototype = {
        constructor: ModuleLogger,
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {String} message
         * @param {Boolean} logBundle
         * @param {Object} [values]
         */
        debug: function(message, logBundle, values) {
            this._forward('debug', message, logBundle, values);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {String} message
         * @param {Boolean} logBundle
         * @param {Object} [values]
         */
        error: function(message, logBundle, values) {
            this._forward('error', message, logBundle, values);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {String} message
         * @param {Boolean} logBundle
         * @param {Object} [values]
         */
        info: function(message, logBundle, values) {
            this._forward('info', message, logBundle, values);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {String} message
         * @param {Boolean} logBundle
         * @param {Object} [values]
         */
        warn: function(message, logBundle, values) {
            this._forward('warn', message, logBundle, values);
        },
        /**
         * @access private
         *
         * @memberof JARS~ModuleState#
         *
         * @param {String} logMethod
         * @param {String} message
         * @param {Boolean} logBundle
         * @param {Object} [values]
         */
        _forward: function(logMethod, message, logBundle, values) {
            var module = this._module,
                Logger = module.loader.getLogger();

            if (Logger) {
                Logger[logMethod + 'WithContext'](getLogContext(module, logBundle), message, values);
            }
        }
    };

    function getLogContext(module, logBundle) {
        return (logBundle ? 'Bundle' : 'Module') + ':' + module.getName(logBundle);
    }

    return ModuleLogger;
});
