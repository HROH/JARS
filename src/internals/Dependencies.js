JARS.internal('Dependencies', function dependenciesSetup(getInternal) {
    'use strict';

    var DependenciesResolver = getInternal('Resolvers/Dependencies'),
        DependenciesHandler = getInternal('Handlers/Dependencies'),
        Modules = getInternal('Handlers/Modules'),
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
         * @param {function()} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            if(!abortIfCircular(this.module)) {
                Modules.request(DependenciesHandler(this, onModulesLoaded));
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
