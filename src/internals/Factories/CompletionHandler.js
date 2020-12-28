JARS.internal('Factories/CompletionHandler', function(getInternal) {
    'use strict';

    var CompletionHandlers = getInternal('Handlers/Completion');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {JARS~internals.Handlers.Completion~Subject}
     */
    function CompletionHandler(injector) {
        return new CompletionHandlers[injector.type](injector.get('subject'));
    }

    return CompletionHandler;
});
