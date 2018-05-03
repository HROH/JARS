JARS.internal('Traverser/PathList', function(getInternal) {
    'use strict';

    var Result = getInternal('Traverser/Result'),
        PathList;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    PathList = {
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         * @param {JARS~internals.Helpers.PathList} pathList
         *
         * @return {boolean}
         */
        onEnter: function(subject, entryModule, depth, pathList) {
            return !pathList.isSorted(subject) && subject.state.isLoaded();
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         * @param {JARS~internals.Helpers.PathList} pathList
         *
         * @return {JARS~internals.Traverser.Result}
         */
        onLeave: function(subject, entryModule, depth, pathList) {
            return new Result(pathList.isSorted(subject) ? pathList : pathList.sort(subject));
        }
    };

    return PathList;
});
