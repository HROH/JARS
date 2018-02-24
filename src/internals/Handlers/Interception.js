JARS.internal('Handlers/Interception', function(getInternal) {
    'use strict';

    var InterceptionSubject = getInternal('Subjects/Interception'),
        extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo,
        getInterceptor = getInternal('Registries/Interceptors').get;

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects.Interception~Info} interceptionInfo
     * @param {JARS~internals.Handlers.StateChange} nextHandler
     */
    function Interception(interceptionInfo, nextHandler) {
        this.requestor = nextHandler.requestor;
        this._nextHandler = nextHandler;
        this._info = interceptionInfo;
    }

    Interception.prototype = {
        constructor: Interception,
        /**
         * @param {string} publisherName
         * @param {object} data
         */
        onModuleLoaded: function(publisherName, data) {
            getInterceptor(this._info.type).intercept(new InterceptionSubject(this.requestor, this._info, this._nextHandler, data.ref));
        },
        /**
         * @method
         */
        onModuleAborted: function() {
            this._nextHandler.onModuleAborted(this._info.fullModuleName);
        }
    };

    /**
     * @param {string} moduleName
     * @param {JARS~internals.Handlers.StateChange}
     *
     * @return {JARS~internals.Handlers.Interception}
     */
    Interception.intercept = function(moduleName, nextHandler) {
        var interceptionInfo = extractInterceptionInfo(moduleName);

        return interceptionInfo.type ? new Interception(interceptionInfo, nextHandler) : nextHandler;
    };

    return Interception;
});
