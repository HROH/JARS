JARS.internal('ModuleLogger', function() {
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
            var module = this._module,
                logBundle = isBundleMap[messageType],
                moduleName = module.getName(logBundle),
                context = (logBundle ? 'Bundle' : 'Module') + ':' + moduleName,
                Logger = module.loader.getLogger(),
                level = logLevelMap[messageType] || 'error';

            if (Logger) {
                Logger[level + 'WithContext'](context, messageType, values, loggerOptions);
            }
        },

    };

    function addMessage(logLevel, message, isBundleMessage) {
        var messageType = messageTemplates.push(message) - 1;

        logLevelMap[messageType] = logLevel;
        isBundleMap[messageType] = isBundleMessage;

        return messageType;
    }

    return ModuleLogger;
});
