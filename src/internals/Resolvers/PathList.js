JARS.internal('Resolvers/PathList', function(getInternal) {
    'use strict';

    var PathListTraverser = getInternal('Traverser/PathList'),
        ModulesTraverser = getInternal('Traverser/Modules'),
        importModules = getInternal('Handlers/Modules').$import,
        each = getInternal('Helpers/Array').each,
        getModule = getInternal('Registries/Modules').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        excluded = ['*', 'System.*'],
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
        computeSortedPathList: function(entryModuleName, callback) {
            var entryModule = getModule(entryModuleName);

            importModules([entryModule.name], function computeSortedPathList() {
                callback(ModulesTraverser(entryModule, PathListTraverser, markModulesSorted(excluded, {
                    sorted: {},

                    paths: []
                })).paths);
            });
        }
    };

    /**
     * @memberof JARS~internals.Resolvers.PathList
     * @inner
     *
     * @param {string[]} modules
     * @param {Object} trackList
     */
    function markModulesSorted(modules, trackList) {
        each(modules, function markModuleSorted(excludedModule) {
            var module;

            trackList.sorted[excludedModule] = true;

            if(isBundle(excludedModule)) {
                module = getModule(excludedModule);
                trackList.sorted[module.name] = true;
                trackList = markModulesSorted(module.bundle.modules, trackList);
            }
        });

        return trackList;
    }

    return PathList;
});
