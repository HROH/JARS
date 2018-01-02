JARS.internal('Handlers/Dependencies', function(getInternal) {
    'use strict';

    var RequestHandler = getInternal('Handlers/Request'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    function DependenciesHandler(dependencies, onModulesLoaded) {
        var module = dependencies.module;

        return new RequestHandler(module, dependencies.getAll(), MSG_STRINGS, onModulesLoaded);
    }

    return DependenciesHandler;
});
