JARS.internal('Resolvers/PathList', function(getInternal) {
    'use strict';

    var PathListTraverser = getInternal('Traverser/PathList'),
        ModulesTraverser = getInternal('Traverser/Modules'),
        importModules = getInternal('Handlers/Import').$import,
        each = getInternal('Helpers/Array').each,
        rootModule = getInternal('Registries/Subjects').getRootModule(),
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
            var entryModule = rootModule.dependencies.resolve(entryModuleName)[0];

            importModules([entryModule.name], function() {
                callback(ModulesTraverser(entryModule, PathListTraverser, markSubjectsSorted(rootModule.dependencies.resolve('System.*'), {
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
     * @param {JARS~internals.Subjects.Subject[]} subjects
     * @param {Object} trackList
     */
    function markSubjectsSorted(subjects, trackList) {
        each(subjects, function markSubjectSorted(excludedSubject) {
            trackList.sorted[excludedSubject.name] = true;

            if(!excludedSubject.isRoot) {
                trackList.sorted[excludedSubject.parent.name] = true;
                trackList = markSubjectsSorted(excludedSubject.dependencies.getAll(), trackList);
            }
        });

        return trackList;
    }

    return PathList;
});
