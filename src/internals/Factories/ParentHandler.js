JARS.internal('Factories/ParentHandler', function(getInternal) {
    'use strict';

    var SubjectsHandler = getInternal('Handlers/Subjects'),
        MSG_STRINGS = ['parent'];

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {JARS~internals.Handlers.Subject}
     */
    function ParentHandler(injector) {
        return new SubjectsHandler(injector.get('subject'), MSG_STRINGS, injector.get('completionHandler'));
    }

    return ParentHandler;
});
