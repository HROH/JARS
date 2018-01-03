JARS.internal('Resolvers/PathList', function(getInternal) {
    'use strict';

    var PathListTraverser = getInternal('Traverser/PathList'),
        traverse = getInternal('Traverser/Modules').traverse,
        importModules = getInternal('Loader').$import,
        arrayEach = getInternal('Utils').arrayEach,
        getModule = getInternal('Registries/Modules').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        excluded = ['*', 'System.*'],
        PathListResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    PathListResolver = {
        /**
         * <p>Computes an array of paths for all the loaded modules
         * in the order they are dependending on each other.
         * This method can be used to create a custom build
         * preferable with a build tool and phantomjs.</p>
         *
         * <p>It is possible to recompute the list.
         * This is only for aesthetics.
         * Even without recomputation the list will still be valid.</p>
         *
         * @param {function(sting[])} callback
         */
        computeSortedPathList: function(entryModuleName, callback) {
            var entryModule = getModule(entryModuleName);

            importModules([entryModule.name], function computeSortedPathList() {
                callback(traverse(entryModule, PathListTraverser, markModulesSorted(excluded, {
                    sorted: {},

                    paths: []
                })).paths);
            });
        }
    };

    function markModulesSorted(modules, value) {
        arrayEach(modules, function markModuleSorted(excludedModule) {
            var module;

            value.sorted[excludedModule] = true;

            if(isBundle(excludedModule)) {
                module = getModule(excludedModule);
                value.sorted[module.name] = true;
                value = markModulesSorted(module.bundle.modules, value);
            }
        });

        return value;
    }

    return PathListResolver;
});
