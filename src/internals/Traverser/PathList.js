JARS.internal('Traverser/PathList', function(getInternal) {
    'use strict';

    var getFullPath = getInternal('Resolvers/Path').getFullPath,
        PathList;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    PathList = {
        /**
         * @param {JARS~internals.Subjects.Module} module
         * @param {JARS~internals.Subjects.Module} entryModule
         * @param {number} depth
         * @param {*} trackList
         *
         * @return {boolean}
         */
        onModuleEnter: function(module, entryModule, depth, trackList) {
            return !isModuleSorted(module, trackList) && module.state.isLoaded();
        },
        /**
         * @param {JARS~internals.Subjects.Module} module
         * @param {JARS~internals.Subjects.Module} entryModule
         * @param {number} depth
         * @param {*} trackList
         *
         * @return {JARS~internals.Traverser.Modules~Result}
         */
        onModuleLeave: function(module, entryModule, depth, trackList) {
            if(!isModuleSorted(module, trackList)) {
                trackList.sorted[module.name] = true;
                trackList.paths.push(getFullPath(module));
            }

            return {
                value: trackList,

                done: false
            };
        }
    };

    /**
     * @param {JARS~internals.Subjects.Module} module
     * @param {*} trackList
     *
     * @return {boolean}
     */
    function isModuleSorted(module, trackList) {
        return trackList.sorted[module.name];
    }

    return PathList;
});
