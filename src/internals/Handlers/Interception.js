JARS.internal('Handlers/Interception', function(getInternal) {
    'use strict';

    var Interception = getInternal('Interception'),
        extractInterceptionInfo = getInternal('InterceptionResolver').extractInterceptionInfo,
        getInterceptor = getInternal('InterceptorRegistry').get;

    function InterceptionHandler(interceptionInfo, interceptor, nextHandler) {
        var handler = this;

        handler.requestor = nextHandler.requestor;
        handler._nextHandler = nextHandler;
        handler._info = interceptionInfo;
        handler._interceptor = interceptor;
    }

    InterceptionHandler.prototype = {
        constructor: InterceptionHandler,

        onModuleLoaded: function(publisherName, data) {
            var handler = this;

            handler._interceptor.intercept(data.ref, new Interception(handler.requestor, handler._info, handler._nextHandler));
        },

        onModuleAborted: function() {
            this._nextHandler.onModuleAborted(this._info.fullModuleName);
        }
    };

    InterceptionHandler.intercept = function(moduleName, nextHandler) {
        var interceptionInfo = extractInterceptionInfo(moduleName),
            interceptor = getInterceptor(interceptionInfo.type);

        return interceptor ? new InterceptionHandler(interceptionInfo, interceptor, nextHandler) : nextHandler;
    };

    return InterceptionHandler;
});
