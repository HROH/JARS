JARS.internal('Factories/ParentHandler', function(getInternal) {
    'use strict';

    var SubjectHandler = getInternal('Handlers/Subject'),
        MSG_STRINGS = ['parent'];

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Handlers.Subject}
     */
    function ParentHandler(injector, subject) {
        return new SubjectHandler(subject, [injector.get('parent')], MSG_STRINGS, injector.get('handler', subject));
    }

    return ParentHandler;
});