JARS.internal('Resolvers/PathList', function(getInternal) {
    'use strict';

    var PathListTraverser = getInternal('Traverser/PathList'),
        ModulesTraverser = getInternal('Traverser/Modules'),
        PathListHelper = getInternal('Helpers/PathList'),
        importModules = getInternal('Handlers/Import').$import,
        rootModuleDeps = getInternal('Registries/Injector').getRootModule().dependencies,
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
            importModules(entryModuleName, function() {
                callback(ModulesTraverser(rootModuleDeps.resolve(entryModuleName)[0], PathListTraverser, new PathListHelper(rootModuleDeps.resolve('System.*'))).paths);
            });
        }
    };

    return PathList;
});
