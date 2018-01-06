JARS.internal('Dependencies', function(getInternal) {
    'use strict';

    var DependenciesResolver = getInternal('Resolvers/Dependencies'),
        DependenciesHandler = getInternal('Handlers/Dependencies'),
        Modules = getInternal('Handlers/Modules'),
        CircularTraverser = getInternal('Traverser/Circular'),
        traverse = getInternal('Traverser/Modules').traverse;

    /**
     * @class
     *
     * @memberof JARS~internals
     *
     * @param {JARS~internals.Module} module
     * @param {boolean} ignoreParent
     */
    function Dependencies(module, ignoreParent) {
        this.parent = ignoreParent ? null : DependenciesResolver.getParent(module);
        this.module = module;
        this._modules = [];
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @return {string[]}
         */
        getAll: function() {
            return this.parent ? [this.parent.name].concat(this._modules) : this._modules;
        },
        /**
         * @param {JARS~internals.Dependencies~Declaration} dependencyModules
         */
        add: function(dependencyModules) {
            this._modules = this._modules.concat(DependenciesResolver.resolveDeps(this.module, dependencyModules));
        },
        /**
         * @return {boolean}
         */
        abortIfCircular: function() {
            return !this.module.isRoot && this.module.config.get('checkCircularDeps') && traverse(this.module, CircularTraverser);
        },
        /**
         * @param {JAR~internals.Handlers.Request#onModulesLoaded} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            this.abortIfCircular() || Modules.request(DependenciesHandler(this, onModulesLoaded));
        }
    };

   /**
    * @typedef {(string|JARS~internals.Dependencies~Declaration[]|Object<string, JARS~internals.Dependencies~Declaration>)} Declaration
    *
    * @memberof JARS~internals.Dependencies
    * @inner
    */

    return Dependencies;
});
