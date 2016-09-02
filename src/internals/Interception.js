JARS.internal('Interception', function interceptionSetup(InternalsManager) {
    'use strict';

    var Resolver = InternalsManager.get('Resolver'),
        ModuleLogger = InternalsManager.get('ModuleLogger'),
        MSG_INTERCEPTION_ERROR = ModuleLogger.addError('error in interception of this module by interceptor "${type}" with data "${data}"');

    /**
     * @access public
     *
     * @constructor Interception
     *
     * @memberof JARS
     * @inner
     *
     * @param {JARS~Module} listeningModule
     * @param {JARS~InterceptionManager~InterceptionInfo} interceptionInfo
     * @param {JARS~Module~SuccessCallback} onSuccess
     * @param {JARS~Module~FailCallback} onFail
     */
    function Interception(listeningModule, interceptionInfo, onSuccess, onFail) {
        var interception = this,
            interceptedModuleName = interceptionInfo.moduleName + interceptionInfo.type + interceptionInfo.data;

        interception.listeningModule = listeningModule;
        interception.info = interceptionInfo;

        interception.success = function(data) {
            onSuccess(interceptedModuleName, data);
        };

        interception.fail = function(error) {
            listeningModule.loader.getModule(interceptionInfo.moduleName).logger.log(error || MSG_INTERCEPTION_ERROR, interceptionInfo);

            onFail(interceptedModuleName);
        };
    }

    Interception.prototype = {
        /**
         * @access public
         *
         * @alias JARS~Interception
         *
         * @memberof JARS~Interception#
         */
        constructor: Interception,
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {String} fileType
         *
         * @return {String}
         */
        getFilePath: function(fileType) {
            var listeningModule = this.listeningModule;

            return !listeningModule.isRoot() && listeningModule.getFullPath(fileType);
        },
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {Array} moduleNames
         * @param {Function()} callback
         * @param {JARS~Module~FailCallback} [errback]
         * @param {Function()} [progressback]
         */
        $importAndLink: function(moduleNames, callback, errback, progressback) {
            var listeningModule = this.listeningModule;

            moduleNames = Resolver.resolve(moduleNames, this.info.moduleName);

            if (!listeningModule.isRoot()) {
                listeningModule.deps.requestAndLink(moduleNames, callback, errback, progressback);
            }
            else {
                listeningModule.loader.$import(moduleNames, callback, errback, progressback);
            }
        },
    };

    return Interception;
});
