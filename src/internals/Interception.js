JARS.internal('Interception', function interceptionSetup(InternalsManager) {
    'use strict';

    var DependenciesResolver = InternalsManager.get('DependenciesResolver');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} listeningModule
     * @param {JARS.internals.InterceptionInfo} interceptionInfo
     * @param {JARS.internals.Interception.SuccessCallback} onSuccess
     * @param {JARS.internals.Interception.FailCallback} onFail
     */
    function Interception(listeningModule, interceptionInfo, onSuccess, onFail) {
        var interception = this;

        interception.listeningModule = listeningModule;
        interception.info = interceptionInfo;
        interception.success = onSuccess;
        interception.fail = onFail;
    }

    Interception.prototype = {
        constructor: Interception,
        /**
         * @param {string} fileType
         *
         * @return {string}
         */
        getFilePath: function(fileType) {
            var listeningModule = this.listeningModule;

            return !listeningModule.isRoot && listeningModule.getFullPath(fileType);
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} moduleNames
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleLoaded
         */
        $importAndLink: function(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var listeningModule = this.listeningModule,
                loader = listeningModule.loader;

            moduleNames = DependenciesResolver.resolveDeps(loader.getModule(this.info.moduleName), moduleNames);

            if (!listeningModule.isRoot) {
                listeningModule.deps.requestAndLink(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded);
            }
            else {
                loader.$import(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded);
            }
        },
    };

    return Interception;
});
