JARS.internal('Handlers/Dependencies', function(getInternal) {
    'use strict';

    var RequestHandler = getInternal('Handlers/Request'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    /**
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Dependencies} dependencies
     * @param {JARS~internals.Handlers.Request#onModulesLoaded} onModulesLoaded
     *
     * @return {JARS~internals.Handlers.Request}
     */
    function Dependencies(dependencies, onModulesLoaded) {
        return new RequestHandler(dependencies.module, dependencies.getAll(), MSG_STRINGS, onModulesLoaded);
    }

    return Dependencies;
});
