JARS.internal('Handlers/StateChange', function() {
    'use strict';

    function StateChangeHandler(index, nextHandler) {
        this.requestor = nextHandler.requestor;
        this._index = index;
        this._nextHandler = nextHandler;
    }

    StateChangeHandler.prototype = {
        constructor: StateChangeHandler,

        onModuleLoaded: function(publisherName, data) {
            data.index = this._index;
            this._nextHandler.onModuleLoaded(publisherName, data);
        },

        onModuleAborted: function(abortedModuleName) {
            this._nextHandler.onModuleAborted(abortedModuleName);
        }
    };

    return StateChangeHandler;
});
