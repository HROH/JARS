JARS.internal('Dependencies', function dependenciesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        DependenciesResolver = getInternal('DependenciesResolver'),
        DependenciesAborter = getInternal('DependenciesAborter'),
        DependenciesChecker = getInternal('DependenciesChecker'),
        ModulesQueue = getInternal('ModulesQueue'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        SEPARATOR = '", "',
        FOUND = 'found ',
        EXPLICIT_DEPENDENCIES = 'explicit',
        INTERCEPTION_DEPENDENCIES = 'interception',
        DEPENDENCIES = ' dependencie(s) "${deps}"',
        MSG_DEPENDENCY_FOUND = FOUND + 'implicit dependency "${dep}"',
        MSG_DEPENDENCIES_FOUND = FOUND + '${kind}' + DEPENDENCIES;

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} module
     * @param {JARS.internals.Logger} logger
     * @param {boolean} [isInterceptionDeps=false]
     */
    function Dependencies(module, logger, isInterceptionDeps) {
        var dependencies = this,
            parentName;

        dependencies._isInterceptionDeps = isInterceptionDeps;
        dependencies._module = module;
        dependencies._logger = logger;
        dependencies._deps = [];

        if(!module.isRoot) {
            parentName = DependenciesResolver.getParentName(module.name);
            dependencies.parent = parentName ? ModulesRegistry.get(parentName) : ModulesRegistry.getRoot();

            if(parentName && !isInterceptionDeps) {
                logger.debug(MSG_DEPENDENCY_FOUND, {
                    dep: parentName
                });
            }
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

            if(DependenciesChecker.hasCircular(module)) {
                DependenciesAborter.abortByCircularDeps(module, DependenciesChecker.getCircular(module));
            } else {
                dependencyModules.length && dependencies._logger.debug(MSG_DEPENDENCIES_FOUND, {
                    kind: dependencies._isInterceptionDeps ? INTERCEPTION_DEPENDENCIES : EXPLICIT_DEPENDENCIES,

                    deps: dependencyModules.join(SEPARATOR)
                });

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
