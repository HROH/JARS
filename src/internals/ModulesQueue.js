JARS.internal('ModulesQueue', function modulesQueueSetup(getInternal) {
    'use strict';

    var InterceptionHandler = getInternal('Handlers/Interception'),
        StateChangeHandler = getInternal('Handlers/StateChange'),
        arrayEach = getInternal('Utils').arrayEach,
        getModule = getInternal('ModulesRegistry').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle;

    /**
     * @callback ModuleLoadedCallback
     *
     * @memberof JARS.internals.ModulesQueue
     *
     * @param {string} moduleName
     * @param {*} moduleRefOrData
     * @param {number} [percentageLoaded]
     */

    /**
     * @callback ModuleAbortedCallback
     *
     * @memberof JARS.internals.ModulesQueue
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} moduleOrBundle
     * @param {string} abortedModuleName
     */

    /**
     * @callback ModulesLoadedCallback
     *
     * @memberof JARS.internals.ModulesQueue
     *
     * @param {Array<*>} moduleRefs
     */


    function ModulesQueueHandler(requestHandler) {
        var handler = this;

        handler.requestor = requestHandler.requestor;
        handler._nextHandler = requestHandler;
        handler._modules = requestHandler.modules;
        handler._total = handler._modules.length;
        handler._refs = [];
        handler._loaded = 0;

        handler.onModulesLoaded();
    }

    ModulesQueueHandler.prototype = {
        request: function() {
            var handler = this;

            arrayEach(handler._modules, function requestModule(requested, index) {
                handler.requestModule(requested, index);
            });
        },

        requestModule: function(requested, index) {
            var module = getModule(requested),
                moduleOrBundle = isBundle(requested) ? module.bundle : module;

            moduleOrBundle.processor.load();
            moduleOrBundle.state.onChange(InterceptionHandler.intercept(requested, new StateChangeHandler(index, this)));
        },

        onModuleLoaded: function(publisherName, data) {
            var handler = this;

            handler._refs[data.index] = data.ref;

            handler._nextHandler.onModuleLoaded(publisherName, data.ref, getPercentage(handler._loaded++, handler._total));
            handler.onModulesLoaded();
        },

        onModuleAborted: function(abortedModuleName) {
            this._nextHandler.onModuleAborted(abortedModuleName);
        },

        onModulesLoaded: function() {
            var handler = this;

            (handler._loaded === handler._total) && handler._nextHandler.onModulesLoaded(handler._refs);
        }
    };

    ModulesQueueHandler.request = function(requestHandler) {
        new ModulesQueueHandler(requestHandler).request();
    };

    function getPercentage(count, total) {
        return Number((count/total).toFixed(2));
    }

    return ModulesQueueHandler;
});
