JARS.internal('Helpers/PathList', function(getInternal) {
    'use strict';

    var PathResolver = getInternal('Resolvers/Path'),
        isModule = getInternal('Types/Subject').isModule,
        each = getInternal('Helpers/Array').each;

    /**
     * @class
     *
     * @memberof JARS~internals.Helpers
     *
     * @param {JARS~internals.Subjects.Subject[]} excludedSubjects
     */
    function PathList(excludedSubjects) {
        this.sorted = {};
        this.paths = [];
        this._sortAll(excludedSubjects);
    }

    PathList.prototype = {
        constructor: PathList,
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         *
         * @return {boolean}
         */
        isSorted: function(subject) {
            return this.sorted[subject.name];
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {boolean} [ignorePath]
         *
         * @return {JARS~internals.Helpers.PathList}
         */
        sort: function(subject, ignorePath) {
            this.sorted[subject.name] = true;
            !ignorePath && isModule(subject.name) && this.paths.push(PathResolver(subject));

            return this;
        },
        /**
         * @param {JARS~internals.Subjects.Subject[]} subjects
         *
         * @return {JARS~internals.Helpers.PathList}
         */
        _sortAll: function(subjects) {
            var pathList = this;

            each(subjects, function(excludedSubject) {
                pathList.sort(excludedSubject, true).sort(excludedSubject.parent, true)._sortAll(excludedSubject.dependencies.getAll());
            });

            return pathList;
        }
    };

    return PathList;
});
