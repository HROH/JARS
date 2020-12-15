JARS.internal('Factories/ParentHandler', function(getInternal) {
    'use strict';

    var SubjectsHandler = getInternal('Handlers/Subjects'),
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
        return new SubjectsHandler(subject, MSG_STRINGS, injector.get('completionHandler', subject));
    }

    return ParentHandler;
});
