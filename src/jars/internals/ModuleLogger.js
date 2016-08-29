JARS.internal('ModuleLogger', function moduleLoggerSetup() {
    'use strict';

    var logLevelMap = {},
        isBundleMap = {},
        messageTemplates = [],
        loggerOptions = {
            tpl: messageTemplates
        };

    function ModuleLogger(module) {
        this._module = module;
    }

    ModuleLogger.addDebug = function(message, isBundleMessage) {
        return addMessage('debug', message, isBundleMessage);
    };

    ModuleLogger.addInfo = function(message, isBundleMessage) {
        return addMessage('info', message, isBundleMessage);
    };

    ModuleLogger.addWarning = function(message, isBundleMessage) {
        return addMessage('warn', message, isBundleMessage);
    };

    ModuleLogger.addError = function(message, isBundleMessage) {
        return addMessage('error', message, isBundleMessage);
    };

    ModuleLogger.prototype = {
        constructor: ModuleLogger,
        /**
         * @access private
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Number} messageType
         * @param {Object} [values]
         */
        log: function(messageType, values) {
            var Logger = module.loader.getLogger();

            if (Logger) {
                Logger[getLogMethod(messageType)](getLogContext(this._module, messageType), messageType, values, loggerOptions);
            }
        },

    };

    function getLogMethod(messageType) {
        return (logLevelMap[messageType] || 'error') + 'WithContext';
    }

    function getLogContext(module, messageType) {
        var logBundle = isBundleMap[messageType];

        return (logBundle ? 'Bundle' : 'Module') + ':' + module.getName(logBundle);
    }

    function addMessage(logLevel, message, isBundleMessage) {
        var messageType = messageTemplates.push(message) - 1;

        logLevelMap[messageType] = logLevel;
        isBundleMap[messageType] = isBundleMessage;

        return messageType;
    }

    return ModuleLogger;
});
