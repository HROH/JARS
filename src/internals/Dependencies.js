JARS.internal('Dependencies', function dependenciesSetup(getInternal) {
    'use strict';

    var DependenciesResolver = getInternal('DependenciesResolver'),
        DependenciesAborter = getInternal('DependenciesAborter'),
        DependenciesChecker = getInternal('DependenciesChecker'),
        ModulesQueue = getInternal('ModulesQueue'),
        DependenciesLogger = getInternal('DependenciesLogger');

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} module
     * @param {boolean} [forInterceptionDeps=false]
     */
    function Dependencies(module, forInterceptionDeps) {
        var dependencies = this;

        dependencies.parent = DependenciesResolver.getParent(module);
        dependencies._module = module;
        dependencies._modules = [];
        dependencies._logger = new DependenciesLogger(module, forInterceptionDeps);
        dependencies._logger.debugParent(dependencies.parent);
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @return {string[]}
         */
        getAll: function() {
            var dependencies = this,
                dependencyModules = dependencies._modules,
                parent = dependencies.parent;

            parent && (dependencyModules = [parent.name].concat(dependencyModules));

            return dependencyModules;
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} dependencyModules
         */
        add: function(dependencyModules) {
            var dependencies = this;

            dependencies._modules = dependencies._modules.concat(DependenciesResolver.resolveDeps(dependencies._module, dependencyModules));
        },
        /**
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            var dependencies = this,
                module = dependencies._module,
                dependencyModules = dependencies._modules;

            if(!DependenciesAborter.abortByCircularDeps(module, DependenciesChecker.getCircular(module))) {
                dependencies._logger.debugDependencies(dependencyModules);

                new ModulesQueue(module, dependencies.getAll()).request(onModulesLoaded, DependenciesAborter.abortByDependency);
            }
        },

        linkRefToParent: function(ref) {
            var parent = this.parent;

            parent && (parent.ref[DependenciesResolver.removeParentName(this._module.name)] = ref);
        }
    };

   /**
    * @typeDef {(string|JARS.internals.Dependencies.Declaration[]|Object<string, JARS.internals.Dependencies.Declaration>)} Declaration
    *
    * @memberof JARS.internals.Dependencies
    */

    return Dependencies;
});
