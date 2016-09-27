JARS.internal('Interception', function interceptionSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = InternalsManager.get('DependenciesResolver');

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
            var listeningModule = this.listeningModule;

            moduleNames = DependenciesResolver.resolveDeps(ModulesRegistry.get(this.info.moduleName), moduleNames);

            if (!listeningModule.isRoot) {
                listeningModule.deps.requestAndLink(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded);
            }
            else {
                getInternal('Loader').$import(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded);
            }
        },
    };

    return Interception;
});
