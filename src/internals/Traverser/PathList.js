JARS.internal('Traverser/PathList', function(getInternal) {
    'use strict';

    var PathResolver = getInternal('Resolvers/Path'),
        SubjectTypes = getInternal('Types/Subject'),
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
         * @param {JARS~internals.Traverser.PathList~TrackList} trackList
         *
         * @return {boolean}
         */
        onEnter: function(subject, entryModule, depth, trackList) {
            return !isSorted(subject, trackList) && subject.state.isLoaded();
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         * @param {JARS~internals.Traverser.PathList~TrackList} trackList
         *
         * @return {JARS~internals.Traverser.Modules~Result}
         */
        onLeave: function(subject, entryModule, depth, trackList) {
            if(!isSorted(subject, trackList)) {
                trackList.sorted[subject.name] = true;
                !SubjectTypes.isInterception(subject.name) && !SubjectTypes.isBundle(subject.name) && trackList.paths.push(PathResolver(subject));
            }

            return {
                value: trackList,

                done: false
            };
        }
    };

    /**
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Traverser.PathList~TrackList} trackList
     *
     * @return {boolean}
     */
    function isSorted(subject, trackList) {
        return trackList.sorted[subject.name];
    }

    /**
     * @typedef {Object} TrackList
     *
     * @memberof JARS~internals.Traverser.PathList
     * @inner
     *
     * @property {Object<string, boolean>} sorted
     * @property {string[]} paths
     */

    return PathList;
});
