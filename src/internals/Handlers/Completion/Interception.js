JARS.internal('Handlers/Completion/Interception', function(getInternal) {
    'use strict';

    var getInterceptor = getInternal('Registries/Interceptors').get,
        MSG_MODULE_INTERCEPTED = 'handling request of "${0}"';

    /**
     * @class
     * @implements {JARS~internals.Handlers.Completion~Subject}
     *
     * @memberof JARS~internals.Handlers.Completion
     *
     * @param {JARS~internals.Subjects.Subject} subject
     */
    function Interception(subject) {
        this._subject = subject;
    }

    Interception.prototype.onCompleted = function() {
        var subject = this._subject;

        subject.requestor.stateUpdater.setIntercepted(MSG_MODULE_INTERCEPTED, [subject.name]);
        getInterceptor(subject.info.type).intercept(subject);
    };

    return Interception;
});
