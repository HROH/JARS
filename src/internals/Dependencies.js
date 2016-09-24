JARS.internal('Dependencies', function dependenciesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('Utils').arrayEach,
        hasOwnProp = getInternal('Utils').hasOwnProp,
        DependenciesResolver = getInternal('DependenciesResolver'),
        LoaderQueue = getInternal('LoaderQueue'),
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
     * @param {JARS.internals.ModuleLogger} logger
     */
    function Dependencies(module, logger) {
        var dependencies = this,
            loader = module.loader,
            parentName;

        dependencies._module = module;
        dependencies._logger = logger;
        dependencies._deps = [];

        dependencies._interceptionDeps = [];

        if(!module.isRoot) {
            parentName = DependenciesResolver.getParentName(module.name);
            dependencies.parent = parentName ? loader.getModule(parentName) : loader.getRootModule();

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
         * @param {JARS.internals.LoaderQueue.ModulesLoadedCallback} onModulesLoaded
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         * @param {JARS.internals.LoaderQueue.ModuleLoadedCallback} onModuleLoaded
         */
        requestAndLink: function(interceptionDependencies, onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var dependencies = this;

            dependencies.add(interceptionDependencies, true);

            loadDependencies(dependencies, interceptionDependencies, onModulesLoaded, onModuleAborted, onModuleLoaded);
        },
        /**
         * @param {JARS.internals.LoaderQueue.ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            var dependencies = this;

            loadDependencies(dependencies, dependencies.getAll(), onModulesLoaded);
        },
        /**
         * @return {boolean}
         */
        hasCircular: function() {
            return this._traceCircular(false, foundMatch, foundMatch);
        },
        /**
         * @return {string[]}
         */
        getCircular: function() {
            return this._traceCircular([], returnMatch, addCurrentToMatchListAndReturn);
        },
        /**
         * @private
         *
         * @param {*} defaultResult
         * @param {function(string):*} resultOnMatch
         * @param {function(*, string)} resultOnLoopMatch
         * @param {Object<string, string>} [traversedModules]
         *
         * @return {*}
         */
        _traceCircular: function(defaultResult, resultOnMatch, resultOnLoopMatch, traversedModules) {
            var dependencies = this,
                module = dependencies._module,
                moduleName = module.name,
                dependencyModules = dependencies.getAll(true),
                traceResult = defaultResult;

            traversedModules = traversedModules || {};

            if (hasOwnProp(traversedModules, moduleName)) {
                traceResult = resultOnMatch(moduleName);
            }
            else {
                traversedModules[moduleName] = true;

                arrayEach(dependencyModules, function findCircularDeps(dependencyName) {
                    var dependencyModule = module.loader.getModule(dependencyName),
                        tmpResult = dependencyModule.deps._traceCircular(traceResult, resultOnMatch, resultOnLoopMatch, traversedModules);

                    tmpResult = resultOnLoopMatch(tmpResult, moduleName);

                    if(tmpResult) {
                        traceResult = tmpResult;

                        return true;
                    }
                });

                delete traversedModules[moduleName];
            }

            return traceResult;
        }
    };

    /**
     * @memberof JARS.internals.Dependencies
     * @inner
     *
     * @param {JARS.internals.Dependencies} dependencies
     * @param {JARS.internals.Dependencies.Declaration} dependenciesToLoad
     * @param {JARS.internals.LoaderQueue.ModulesLoadedCallback} onModulesLoaded
     * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
     * @param {JARS.internals.LoaderQueue.ModuleLoadedCallback} onModuleLoaded
     */
    function loadDependencies(dependencies, dependenciesToLoad, onModulesLoaded, onModuleAborted, onModuleLoaded) {
        var module = dependencies._module,
            hasCircularDependencies = !module.isRoot && module.config.get('checkCircularDeps') && dependencies.hasCircular();

        if(hasCircularDependencies) {
            module.abort(dependencies.getCircular());
        }
        else {
            new LoaderQueue(module, onModulesLoaded, onModuleLoaded, onModuleAborted).loadModules(dependenciesToLoad);
        }
    }

    /**
     * @memberof JARS.internals.Dependencies
     * @inner
     *
     * @param {string} matchingModuleName
     *
     * @return {string[]}
     */
    function returnMatch(matchingModuleName) {
        return [matchingModuleName];
    }

    /**
     * @memberof JARS.internals.Dependencies
     * @inner
     *
     * @param {string[]} result
     * @param {string} matchingModuleName
     *
     * @return {string[]}
     */
    function addCurrentToMatchListAndReturn(result, matchingModuleName) {
        if(result.length) {
            result.unshift(matchingModuleName);

            return result;
        }
    }

    /**
     * @memberof JARS.internals.Dependencies
     * @inner
     *
     * @param {(string|string[])} match
     *
     * @return {boolean}
     */
    function foundMatch(match) {
        return !!match;
    }

   /**
    * @typeDef {(string|JARS.internals.Dependencies.Declaration[]|Object<string, JARS.internals.Dependencies.Declaration>)} Declaration
    *
    * @memberof JARS.internals.Dependencies
    */

    return Dependencies;
});
