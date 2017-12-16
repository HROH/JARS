JARS.internal('Handlers/StateChange', function() {
    'use strict';

    function StateChangeHandler(index, nextHandler) {
        var handler = this;

        handler.requestor = nextHandler.requestor;
        handler._index = index;
        handler._nextHandler = nextHandler;
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
