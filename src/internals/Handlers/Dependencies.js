JARS.internal('Handlers/Dependencies', function(getInternal) {
    'use strict';

    var RequestHandler = getInternal('Handlers/Request'),
        FileNameResolver = getInternal('Resolvers/FileName'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    function DependenciesHandler(dependencies, onModulesLoaded) {
        var module = dependencies.module;

        return new RequestHandler(module, dependencies.getAll(), MSG_STRINGS, function(dependencyRefs) {
            var parent = dependencies.parent;

            onModulesLoaded(dependencyRefs);

            parent && (parent.ref[FileNameResolver(module.name)] = module.ref);
        });
    }

    return DependenciesHandler;
});
