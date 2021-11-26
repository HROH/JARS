JARS.internal('Factories/DependenciesHandler', function(getInternal) {
    'use strict';

    var SubjectsHandler = getInternal('Handlers/Subjects'),
        DependenciesCompletionHandler = getInternal('Handlers/Completion/Dependencies'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     * @param {JARS~internals.Handlers.Completion.Dependencies~Provide} [provide]
     * @param {JARS~internals.Handlers.Completion.Dependencies~Progress} [progress]
     * @param {JARS~internals.Handlers.Completion.Dependencies~Error} [error]
     *
     * @return {JARS~internals.Handlers.Subject}
     */
    function DependenciesHandler(injector, callbacks) {
        var subject = injector.get('subject');

        return new SubjectsHandler(subject, MSG_STRINGS, new DependenciesCompletionHandler(subject, callbacks.provide, callbacks.progress, callbacks.error));
    }

    return DependenciesHandler;
});
