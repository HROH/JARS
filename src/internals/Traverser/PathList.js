JARS.internal('Traverser/PathList', function(getInternal) {
    'use strict';

    var PathResolver = getInternal('Resolvers/Path'),
        BundleResolver = getInternal('Resolvers/Bundle'),
        InterceptionResolver = getInternal('Resolvers/Interception'),
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
         * @param {*} trackList
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
         * @param {Object} trackList
         *
         * @return {JARS~internals.Traverser.Modules~Result}
         */
        onLeave: function(subject, entryModule, depth, trackList) {
            if(!isSorted(subject, trackList)) {
                trackList.sorted[subject.name] = true;
                !InterceptionResolver.isInterception(subject.name) && !BundleResolver.isBundle(subject.name) && trackList.paths.push(PathResolver(subject));
            }

            return {
                value: trackList,

                done: false
            };
        }
    };

    /**
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {Object} trackList
     *
     * @return {boolean}
     */
    function isSorted(subject, trackList) {
        return trackList.sorted[subject.name];
    }

    return PathList;
});
