JARS.internal('Factories/DependenciesHandler', function(getInternal) {
    'use strict';

    var SubjectsHandler = getInternal('Handlers/Subjects'),
        DependenciesCompletionHandler = getInternal('Handlers/Completion/Dependencies'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Handlers.Subject}
     */
    function DependenciesHandler(injector, args) {
        var subject = args[0];

        return new SubjectsHandler(subject, MSG_STRINGS, new DependenciesCompletionHandler(subject, args[1]));
    }

    return DependenciesHandler;
});
