JARS.internal('Subjects/Dependencies', function(getInternal) {
    'use strict';

    var AnyResolutionStrategy = getInternal('Strategies/Type/Any');

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects
     *
     * @param {JARS~internals.Subjects~Subject} requestor
     * @param {JARS~internals.States.Subject} state
     * @param {JARS~internals.Strategies.Resolution~Strategy} strategy
     */
    function Dependencies(requestor, state, strategy) {
        this._requestor = requestor;
        this._state = state;
        this._strategy = strategy;
        this._modules = [];
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @return {string[]}
         */
        getAll: function() {
            return this._modules;
        },
        /**
         * @param {JARS~internals.Subjects~Declaration} modules
         */
        add: function(modules) {
            if(this._state.isWaiting() || this._state.isLoading()) {
                this._modules = this._modules.concat(this.resolve(modules));
            }
        },
        /**
         * @param {string} moduleName
         *
         * @return {(JARS~internals.Subjects.Subject|null)}
         */
        find: function(moduleName) {
            var index = this._modules.indexOf(this.resolve([moduleName])[0]);

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
