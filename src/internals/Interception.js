JARS.internal('Interception', function interceptionSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = InternalsManager.get('DependenciesResolver'),
        MSG_INTERCEPTION_ERROR = 'error in interception of this module by interceptor "${type}" with data "${data}"';

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
        interception.success = createSuccessHandler(interceptionInfo, onSuccess);
        interception.fail = createFailHandler(interceptionInfo, onFail);
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
         * @param {JARS.internals.State.AbortedCallback} onModuleAborted
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleLoaded
         */
        $importAndLink: function(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var listeningModule = this.listeningModule,
                interceptionDeps = listeningModule.interceptionDeps;

            moduleNames = DependenciesResolver.resolveDeps(ModulesRegistry.get(this.info.moduleName), moduleNames);

            if (!listeningModule.isRoot) {
                interceptionDeps.add(moduleNames);
                interceptionDeps.request(onModulesLoaded);
            }
            else {
                getInternal('Loader').$import(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded);
            }
        },
    };

    function createFailHandler(interceptionInfo, onModuleAborted) {
        var interceptedModuleName = interceptionInfo.fullModuleName;

        return function onInterceptionFail(error) {
            ModulesRegistry.get(interceptedModuleName).logger.error(error || MSG_INTERCEPTION_ERROR, interceptionInfo);

            onModuleAborted(interceptedModuleName);
        };
    }

    function createSuccessHandler(interceptionInfo, onModuleLoaded) {
        return function onInterceptionSuccess(data) {
            onModuleLoaded(interceptionInfo.fullModuleName, data);
        };
    }

    return Interception;
});
