JARS.internal('Factories/DependenciesHandler', function(getInternal) {
    'use strict';

    var SubjectsHandler = getInternal('Handlers/Subjects'),
        DependenciesCompletionHandler = getInternal('Handlers/Completion/Dependencies'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     * @param {JARS~internals.Subjects.Subject~Provide} provide
     *
     * @return {JARS~internals.Handlers.Subject}
     */
    function DependenciesHandler(injector, provide) {
        var subject = injector.get('subject');

        return new SubjectsHandler(subject, MSG_STRINGS, new DependenciesCompletionHandler(subject, provide));
    }

    return DependenciesHandler;
});
