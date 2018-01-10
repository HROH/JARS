JARS.internal('Handlers/Modules', function modulesQueueSetup(getInternal) {
    'use strict';

    var ImportHandler = getInternal('Handlers/Import'),
        InterceptionHandler = getInternal('Handlers/Interception'),
        ModuleHandler = getInternal('Handlers/Module'),
        ModulesRef = getInternal('Refs/Modules'),
        each = getInternal('Helpers/Array').each,
        getModule = getInternal('Registries/Modules').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle;

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Handlers.Request} requestHandler
     */
    function Modules(requestHandler) {
        var handler = this;

        handler.requestor = requestHandler.requestor;
        handler._nextHandler = requestHandler;
        handler._modules = requestHandler.modules;
        handler._total = handler._modules.length;
        handler._ref = new ModulesRef();
        handler._loaded = 0;

        handler.onModulesLoaded();
    }

    Modules.prototype = {
        /**
         * @method
         */
        request: function() {
            var handler = this;

            each(handler._modules, function requestModule(requested, index) {
                handler.requestModule(requested, index);
            });
        },
        /**
         * @param {string} requested
         * @param {number} index
         */
        requestModule: function(requested, index) {
            var module = getModule(requested),
                moduleOrBundle = isBundle(requested) ? module.bundle : module,
                changeHandler = new ModuleHandler(index, this);

            moduleOrBundle.processor.load();
            moduleOrBundle.state.onChange(isBundle(requested) ? changeHandler : InterceptionHandler.intercept(requested, changeHandler));
        },
        /**
         * @param {string} publisherName
         * @param {object} data
         */
        onModuleLoaded: function(publisherName, data) {
            var handler = this;

            handler._ref.add(data.index, data.ref);

            handler._nextHandler.onModuleLoaded(publisherName, data.ref, getPercentage(handler._loaded++, handler._total));
            handler.onModulesLoaded();
        },
        /**
         * @param {string} abortedModuleName
         */
        onModuleAborted: function(abortedModuleName) {
            this._nextHandler.onModuleAborted(abortedModuleName);
        },
        /**
         * @method
         */
        onModulesLoaded: function() {
            this._loaded === this._total && this._nextHandler.onModulesLoaded(this._ref);
        }
    };

    /**
     * @param {JARS~internals.Handlers.Request} requestHandler
     */
    Modules.request = function(requestHandler) {
        new Modules(requestHandler).request();
    };

    /**
     * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} moduleNames
     * @param {function(...*)} onModulesImported
     * @param {function()} onModuleAborted
     * @param {function()} onModuleImported
     */
    Modules.$import = function(moduleNames, onModulesImported, onModuleAborted, onModuleImported) {
        Modules.request(ImportHandler(moduleNames, onModulesImported, onModuleAborted, onModuleImported));
    };

    /**
     * @memberof JARS~internals.Handlers.Modules
     * @inner
     *
     * @param {number} count
     * @param {number} total
     *
     * @return {number}
     */
    function getPercentage(count, total) {
        return Number((count/total).toFixed(2));
    }

    return Modules;
});
