JARS.internal('Factories/Handler', function(getInternal) {
    'use strict';

    var CompletionHandlers = getInternal('Handlers/Completion');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Handlers.Completion~Subject}
     */
    function Handler(injector, subject) {
        return new CompletionHandlers[injector.type](subject);
    }

    return Handler;
});
