JARS.internal('Dependencies', function dependenciesSetup(getInternal) {
    'use strict';

    var DependenciesResolver = getInternal('DependenciesResolver'),
        DependenciesAborter = getInternal('DependenciesAborter'),
        DependenciesChecker = getInternal('DependenciesChecker'),
        ModulesQueue = getInternal('ModulesQueue'),
        ModulesRegistry = getInternal('ModulesRegistry'),
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
        var dependencies = this,
            parentName;

        dependencies._module = module;
        dependencies._logger = new DependenciesLogger(module, forInterceptionDeps);
        dependencies._deps = [];

        if(!module.isRoot) {
            parentName = DependenciesResolver.getParentName(module.name);
            dependencies.parent = parentName ? ModulesRegistry.get(parentName) : ModulesRegistry.getRoot();

            dependencies._logger.debugParentDependency(parentName);
        }
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @return {string[]}
         */
        getAll: function() {
            var dependencies = this,
                dependencyModules = dependencies._deps,
                parent = dependencies.parent;

            parent && (dependencyModules = [parent.name].concat(dependencyModules));

            return dependencyModules;
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} dependencyModules
         */
        add: function(dependencyModules) {
            var dependencies = this;

            dependencies._deps = dependencies._deps.concat(DependenciesResolver.resolveDeps(dependencies._module, dependencyModules));
        },
        /**
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            var dependencies = this,
                module = dependencies._module,
                dependencyModules = dependencies._deps;

            if(!DependenciesAborter.abortByCircularDeps(module, DependenciesChecker.getCircular(module))) {
                dependencies._logger.debugDependencies(dependencyModules);

                new ModulesQueue(module, dependencies.getAll()).request(onModulesLoaded, DependenciesAborter.abortByDependency);
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
