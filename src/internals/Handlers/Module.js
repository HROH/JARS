JARS.internal('Handlers/Module', function() {
    'use strict';

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {number} index
     * @param {JARS~internals.Handlers.Request}
     */
    function Module(index, nextHandler) {
        this.requestor = nextHandler.requestor;
        this._index = index;
        this._nextHandler = nextHandler;
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @param {string} publisherName
         * @param {object} data
         */
        onModuleLoaded: function(publisherName, data) {
            data.index = this._index;
            this._nextHandler.onModuleLoaded(publisherName, data);
        },
        /**
         * @param {string} abortedModuleName
         */
        onModuleAborted: function(abortedModuleName) {
            this._nextHandler.onModuleAborted(abortedModuleName);
        }
    };

    return Module;
});
