JARS.internal('Helpers/PathList', function(getInternal) {
    'use strict';

    var PathResolver = getInternal('Resolvers/Path'),
        isModule = getInternal('Types/Subject').isModule,
        reduce = getInternal('Helpers/Array').reduce;

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
            return reduce(subjects, function(pathList, excludedSubject) {
                return pathList.sort(excludedSubject, true).sort(excludedSubject.parent, true)._sortAll(excludedSubject.dependencies.getAll());
            }, this);
        }
    };

    return PathList;
});
