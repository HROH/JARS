JARS.internal('Handlers/Interception', function(getInternal) {
    'use strict';

    var Interception = getInternal('Interception'),
        extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
        getInterceptor = getInternal('InterceptorRegistry').get;

    function InterceptionHandler(interceptionInfo, nextHandler) {
        var handler = this;

        handler.requestor = nextHandler.requestor;
        handler._nextHandler = nextHandler;
        handler._info = interceptionInfo;
    }

    InterceptionHandler.prototype = {
        constructor: InterceptionHandler,

        onModuleLoaded: function(publisherName, data) {
            var handler = this;

            getInterceptor(handler._info.type).intercept(new Interception(handler.requestor, handler._info, handler._nextHandler, data.ref));
        },

        onModuleAborted: function() {
            this._nextHandler.onModuleAborted(this._info.fullModuleName);
        }
    };

    InterceptionHandler.intercept = function(moduleName, nextHandler) {
        var interceptionInfo = extractInterceptionInfo(moduleName);

        return interceptionInfo.type ? new InterceptionHandler(interceptionInfo, nextHandler) : nextHandler;
    };

    return InterceptionHandler;
});
