JARS.internal('Resolvers/PathList', function(getInternal) {
    'use strict';

    var PathListTraverser = getInternal('Traverser/PathList'),
        SubjectsTraverser = getInternal('Traverser/Subjects'),
        PathListHelper = getInternal('Helpers/PathList'),
        SubjectsRegistry = getInternal('Registries/Subjects'),
        PathList;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    PathList = {
        /**
         * <p>Computes an array of paths for the given module and
         * all its dependencies in the order they are dependending
         * on each other. This method can be used to create a custom
         * build.</p>
         *
         * @param {string} entryModuleName
         * @param {function(string[])} callback
         */
        resolve: function(entryModuleName, callback) {
            var anonymousModule = SubjectsRegistry.getAnonymousModule(),
                dependencies = anonymousModule.dependencies;

            anonymousModule.$import(entryModuleName);
            anonymousModule.$export(function() {
                callback(SubjectsTraverser(dependencies.getAll()[0], PathListTraverser, new PathListHelper(dependencies.resolve('System.*'))).paths);
            });
        }
    };

    return PathList;
});
