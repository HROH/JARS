JARS.internal('Handlers/Subjects/Interception', function(getInternal) {
    'use strict';
    
    var getInterceptor = getInternal('Registries/Interceptors').get,
        MSG_MODULE_INTERCEPTED = 'handling request of "${0}"';

    /**
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject 
     */
    function Interception(subject) {
        subject.requestor.state.setIntercepted(MSG_MODULE_INTERCEPTED, [subject.name]);
        getInterceptor(subject.info.type).intercept(subject);
    }

    return Interception;
});
