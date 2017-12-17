JARS.internal('Interception', function interceptionSetup(getInternal) {
    'use strict';

    var getModule = getInternal('ModulesRegistry').get,
        resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        getFullPath = getInternal('Resolvers/Path').getFullPath,
        MSG_INTERCEPTION_ERROR = 'error in interception of this module by interceptor "${type}" with data "${data}"';

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} requestor
     * @param {JARS.internals.InterceptionInfo} interceptionInfo
     * @param {JARS.internals.StateChangeHandler} handler
     */
    function Interception(requestor, interceptionInfo, handler) {
        var interception = this;

        interception.requestor = requestor;
        interception.info = interceptionInfo;
        interception._handler = handler;
    }

    Interception.prototype = {
        constructor: Interception,
        /**
         * @param {string} fileType
         *
         * @return {string}
         */
        getFilePath: function(fileType) {
            return getFullPath(this.requestor, fileType);
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} moduleNames
         * @param {function()} onModulesLoaded
         */
        $importAndLink: function(moduleNames, onModulesLoaded) {
            var interceptionDeps = this.requestor.interceptionDeps;

            interceptionDeps.add(resolveDeps(getModule(this.info.moduleName), moduleNames));
            interceptionDeps.request(onModulesLoaded);
        },

        success: function(data) {
            this._handler.onModuleLoaded(this.info.fullModuleName, {
                ref: data
            });
        },

        fail: function(error) {
            var interceptedModuleName = this.info.fullModuleName;

            getModule(interceptedModuleName).logger.error(error || MSG_INTERCEPTION_ERROR, this.info);

            this._handler.onModuleAborted(interceptedModuleName);
        }
    };

    return Interception;
});
