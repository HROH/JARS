JARS.internal('Subjects/Dependencies/Module', function(getInternal) {
    'use strict';

    var DependenciesResolver = getInternal('Resolvers/Dependencies'),
        DependenciesHandler = getInternal('Handlers/Dependencies'),
        Modules = getInternal('Handlers/Modules'),
        CircularTraverser = getInternal('Traverser/Circular'),
        ModulesTraverser = getInternal('Traverser/Modules');

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects.Dependencies
     *
     * @param {JARS~internals.Subjects.Module} module
     * @param {boolean} ignoreParent
     */
    function Module(module, ignoreParent) {
        this.parent = ignoreParent ? null : DependenciesResolver.getParent(module);
        this.module = module;
        this._modules = [];
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @return {string[]}
         */
        getAll: function() {
            return this.parent ? [this.parent.name].concat(this._modules) : this._modules;
        },
        /**
         * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} dependencyModules
         */
        add: function(dependencyModules) {
            this._modules = this._modules.concat(DependenciesResolver.resolveDeps(this.module, dependencyModules));
        },
        /**
         * @return {boolean}
         */
        abortIfCircular: function() {
            return !this.module.isRoot && this.module.config.get('checkCircularDeps') && ModulesTraverser(this.module, CircularTraverser);
        },
        /**
         * @param {JARS~internals.Handlers.Request#onModulesLoaded} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            this.abortIfCircular() || Modules.request(DependenciesHandler(this, onModulesLoaded));
        }
    };

   /**
    * @typedef {(string|JARS~internals.Subjects.Dependencies.Module~Declaration[]|Object<string, JARS~internals.Subjects.Dependencies.Module~Declaration>)} Declaration
    *
    * @memberof JARS~internals.Subjects.Dependencies.Module
    * @inner
    */

    return Module;
});
