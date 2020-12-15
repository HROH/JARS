JARS.internal('Factories/CompletionHandler', function(getInternal) {
    'use strict';

    var CompletionHandlers = getInternal('Handlers/Completion');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Handlers.Completion~Subject}
     */
    function CompletionHandler(injector, subject) {
        return new CompletionHandlers[injector.type](subject);
    }

    return CompletionHandler;
});
