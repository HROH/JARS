JARS.internal('Handlers/Interception', function(getInternal) {
    'use strict';

    var Interception = getInternal('Interception'),
        extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
        getInterceptor = getInternal('Registries/Interceptor').get;

    function InterceptionHandler(interceptionInfo, nextHandler) {
        this.requestor = nextHandler.requestor;
        this._nextHandler = nextHandler;
        this._info = interceptionInfo;
    }

    InterceptionHandler.prototype = {
        constructor: InterceptionHandler,

        onModuleLoaded: function(publisherName, data) {
            getInterceptor(this._info.type).intercept(new Interception(this.requestor, this._info, this._nextHandler, data.ref));
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
