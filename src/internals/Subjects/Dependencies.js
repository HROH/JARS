JARS.internal('Subjects/Dependencies', function(getInternal) {
    'use strict';

    var AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        CircularTraverser = getInternal('Traverser/Circular'),
        SubjectsTraverser = getInternal('Traverser/Subjects'),
        States = getInternal('State/States'),
        CHECK_CIRCULAR_DEPS = getInternal('Configs/Options').CHECK_CIRCULAR_DEPS;

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {JARS~internals.State.Subject} state
     * @param {JARS~internals.Strategies.Resolution~Strategy} strategy
     */
    function Dependencies(requestor, state, strategy) {
        this._requestor = requestor;
        this._state = state;
        this._strategy = strategy;
        this._subjects = [];
        this._circular = false;
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @return {JARS~internals.Subjects.Subject[]}
         */
        getAll: function() {
            return this._subjects;
        },
        /**
         * @return {(string[]|boolean)}
         */
        getCircular: function() {
            var entrySubject = this._requestor;

            return this._circular || (this._circular = !entrySubject.isRoot && entrySubject.config.get(CHECK_CIRCULAR_DEPS) && SubjectsTraverser(entrySubject, CircularTraverser));
        },
        /**
         * @return {JARS~internals.Subjects.Subject[]}
         */
        getNotCircular: function() {
            return this.getCircular() ? [] : this.getAll();
        },
        /**
         * @param {JARS~internals.Subjects~Declaration} subjects
         */
        add: function(subjects) {
            if(this._state.is(States.WAITING) || this._state.is(States.LOADING)) {
                this._subjects = this._subjects.concat(this.resolve(subjects));
            }
        },
        /**
         * @param {string} subjectName
         *
         * @return {(JARS~internals.Subjects.Subject|null)}
         */
        find: function(subjectName) {
            var index = this._subjects.indexOf(this.resolve([subjectName])[0]);

            return index > -1 ? this._subjects[index] : null;
        },
        /**
         * @param {JARS~internals.Subjects~Declaration} subjects
         *
         * @return {JARS~internals.Subjects.Subject[]}
         */
        resolve: function(subjects) {
            return AnyResolutionStrategy(this._requestor, this._requestor, subjects, this._strategy);
        }
    };

    return Dependencies;
});
