JARS.internal('Subjects/Dependencies', function(getInternal) {
    'use strict';

    var AnyResolutionStrategy = getInternal('Strategies/Type/Any'),
        CircularTraverser = getInternal('Traverser/Circular'),
        ModulesTraverser = getInternal('Traverser/Modules'),
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
        this._modules = [];
        this._circular = false;
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @return {JARS~internals.Subjects.Subject[]}
         */
        getAll: function() {
            return this._modules;
        },
        /**
         * @return {(string[]|boolean)}
         */
        getCircular: function() {
            var entryModule = this._requestor;

            return this._circular || (this._circular = !entryModule.isRoot && entryModule.config.get(CHECK_CIRCULAR_DEPS) && ModulesTraverser(entryModule, CircularTraverser));
        },
        /**
         * @return {JARS~internals.Subjects.Subject[]}
         */
        getNotCircular: function() {
            return this.getCircular() ? [] : this.getAll();
        },
        /**
         * @param {JARS~internals.Subjects~Declaration} modules
         */
        add: function(modules) {
            if(this._state.is(States.WAITING) || this._state.is(States.LOADING)) {
                this._modules = this._modules.concat(this.resolve(modules));
            }
        },
        /**
         * @param {string} subjectName
         *
         * @return {(JARS~internals.Subjects.Subject|null)}
         */
        find: function(subjectName) {
            var index = this._modules.indexOf(this.resolve([subjectName])[0]);

            return index > -1 ? this._modules[index] : null;
        },
        /**
         * @param {JARS~internals.Subjects~Declaration} modules
         *
         * @return {JARS~internals.Subjects.Subject[]}
         */
        resolve: function(modules) {
            return AnyResolutionStrategy(this._requestor, this._requestor, modules, this._strategy);
        }
    };

    return Dependencies;
});
