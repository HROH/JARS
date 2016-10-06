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
        DEPENDENCIES = ' dependencie(s) "${deps}"',
        MSG_DEPENDENCY_FOUND = FOUND + 'implicit dependency "${dep}"',
        MSG_DEPENDENCIES_FOUND = FOUND + 'explicit' + DEPENDENCIES,
        MSG_INTERCEPTION_DEPENDENCIES_FOUND = FOUND + 'interception' + DEPENDENCIES;

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} module
     * @param {JARS.internals.Logger} logger
     */
    function Dependencies(module, logger) {
        var dependencies = this,
            parentName;

        dependencies._module = module;
        dependencies._logger = logger;
        dependencies._deps = [];
        dependencies._aborter = new DependenciesAborter(module);

        dependencies._interceptionDeps = [];

        if(!module.isRoot) {
            parentName = DependenciesResolver.getParentName(module.name);
            dependencies.parent = parentName ? ModulesRegistry.get(parentName) : ModulesRegistry.getRoot();

            parentName && logger.debug(MSG_DEPENDENCY_FOUND, {
                dep: parentName
            });
        }
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @param {boolean} getInterceptionDeps
         *
         * @return {string[]}
         */
        getAll: function(getInterceptionDeps) {
            var dependencies = this,
                dependencyModules = dependencies._deps,
                parent = dependencies.parent;

            getInterceptionDeps && (dependencyModules = dependencyModules.concat(dependencies._interceptionDeps));
            parent && (dependencyModules = [parent.name].concat(dependencyModules));

            return dependencyModules;
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} dependencyModules
         * @param {boolean} [addInterceptionDependencies]
         */
        add: function(dependencyModules, addInterceptionDependencies) {
            var dependencies = this,
                message, depsKey;

            if(addInterceptionDependencies) {
                message = MSG_INTERCEPTION_DEPENDENCIES_FOUND;
                depsKey = '_interceptionDeps';
            }
            else {
                message = MSG_DEPENDENCIES_FOUND;
                depsKey = '_deps';
                dependencyModules = DependenciesResolver.resolveDeps(dependencies._module, dependencyModules);
            }

            dependencyModules.length && dependencies._logger.debug(message, {
                deps: dependencyModules.join(SEPARATOR)
            });

            dependencies[depsKey] = dependencies[depsKey].concat(dependencyModules);
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} interceptionDependencies
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         * @param {JARS.internals.State.AbortedCallback} onModuleAborted
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleLoaded
         */
        requestAndLink: function(interceptionDependencies, onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var dependencies = this;

            dependencies.add(interceptionDependencies, true);

            loadDependencies(dependencies, interceptionDependencies, onModulesLoaded, onModuleAborted, onModuleLoaded);
        },
        /**
         * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            var dependencies = this;

            loadDependencies(dependencies, dependencies.getAll(), onModulesLoaded, function onModuleAborted(dependencyName) {
                dependencies._aborter.abortDependency(dependencyName);
            });
        }
    };

    /**
     * @memberof JARS.internals.Dependencies
     * @inner
     *
     * @param {JARS.internals.Dependencies} dependencies
     * @param {JARS.internals.Dependencies.Declaration} dependenciesToLoad
     * @param {JARS.internals.ModulesQueue.ModulesLoadedCallback} onModulesLoaded
     * @param {JARS.internals.State.AbortedCallback} onModuleAborted
     * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleLoaded
     */
    function loadDependencies(dependencies, dependenciesToLoad, onModulesLoaded, onModuleAborted, onModuleLoaded) {
        var module = dependencies._module;

        if(DependenciesChecker.hasCircular(module)) {
            dependencies._aborter.abortCircularDeps(DependenciesChecker.getCircular(module));
        } else {
            new ModulesQueue(module, dependenciesToLoad).request(onModulesLoaded, onModuleAborted, onModuleLoaded);
        }
    }

   /**
    * @typeDef {(string|JARS.internals.Dependencies.Declaration[]|Object<string, JARS.internals.Dependencies.Declaration>)} Declaration
    *
    * @memberof JARS.internals.Dependencies
    */

    return Dependencies;
});
