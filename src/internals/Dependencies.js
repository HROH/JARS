JARS.internal('Dependencies', function dependenciesSetup(getInternal) {
    'use strict';

    var DependenciesResolver = getInternal('DependenciesResolver'),
        DependenciesHandler = getInternal('Handlers/Dependencies'),
        ModulesQueue = getInternal('ModulesQueue'),
        abortIfCircular = getInternal('DependenciesChecker').abortIfCircular;

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} module
     */
    function Dependencies(module) {
        var dependencies = this;

        dependencies.parent = DependenciesResolver.getParent(module);
        dependencies.module = module;
        dependencies._modules = [];
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
         * @param {JARS.internals.Dependencies.Declaration} dependencyModules
         */
        add: function(dependencyModules) {
            this._modules = this._modules.concat(DependenciesResolver.resolveDeps(this.module, dependencyModules));
        },
        /**
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            if(!abortIfCircular(this.module)) {
                ModulesQueue.request(DependenciesHandler(this, onModulesLoaded));
            }
        }
    };

   /**
    * @typeDef {(string|JARS.internals.Dependencies.Declaration[]|Object<string, JARS.internals.Dependencies.Declaration>)} Declaration
    *
    * @memberof JARS.internals.Dependencies
    */

    return Dependencies;
});
