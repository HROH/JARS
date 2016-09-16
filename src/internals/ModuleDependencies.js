JARS.internal('ModuleDependencies', function moduleDependenciesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('Utils').arrayEach,
        hasOwnProp = getInternal('Utils').hasOwnProp,
        Resolver = getInternal('Resolver'),
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
    function ModuleDependencies(module, logger) {
        var moduleDependencies = this,
            parent;

        moduleDependencies._module = module;
        moduleDependencies._logger = logger;
        moduleDependencies._deps = [];

        moduleDependencies._interceptionDeps = [];

        if(!module.isRoot()) {
            parent = moduleDependencies.parent = module.loader.getModule(Resolver.getParentName(module.name) || Resolver.getRootName());

            logger.debug(MSG_DEPENDENCY_FOUND, {
                dep: parent.name
            });
        }
    }

    ModuleDependencies.prototype = {
        constructor: ModuleDependencies,
        /**
         * @param {boolean} getInterceptionDeps
         *
         * @return {string[]}
         */
        getAll: function(getInterceptionDeps) {
            var moduleDependencies = this,
                dependencies = moduleDependencies._deps,
                parent = moduleDependencies.parent;

            getInterceptionDeps && (dependencies = dependencies.concat(moduleDependencies._interceptionDeps));
            parent && (dependencies = [parent.name].concat(dependencies));

            return dependencies;
        },
        /**
         * @param {JARS.internals.ModuleDependencies.Declaration} dependencies
         * @param {boolean} [addInterceptionDependencies]
         */
        add: function(dependencies, addInterceptionDependencies) {
            var moduleDependencies = this,
                message, depsKey;

            if(addInterceptionDependencies) {
                message = MSG_INTERCEPTION_DEPENDENCIES_FOUND;
                depsKey = '_interceptionDeps';
            }
            else {
                message = MSG_DEPENDENCIES_FOUND;
                depsKey = '_deps';
                dependencies = Resolver.resolve(moduleDependencies._module, dependencies);
            }

            dependencies.length && moduleDependencies._logger.debug(message, {
                deps: dependencies.join(SEPARATOR)
            });

            moduleDependencies[depsKey] = moduleDependencies[depsKey].concat(dependencies);
        },
        /**
         * @param {JARS.internals.ModuleDependencies.Declaration} interceptionDependencies
         * @param {JARS.internals.LoaderQueue.ModulesLoadedCallback} onModulesLoaded
         * @param {JARS.internals.ModuleQueue.FailCallback} onModuleAborted
         * @param {JARS.internals.LoaderQueue.ModuleLoadedCallback} onModuleLoaded
         */
        requestAndLink: function(interceptionDependencies, onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var moduleDependencies = this;

            moduleDependencies.add(interceptionDependencies, true);

            if(!moduleDependencies._abortCircular()) {
                new LoaderQueue(moduleDependencies._module, onModulesLoaded, onModuleLoaded, onModuleAborted).loadModules(interceptionDependencies);
            }
        },
        /**
         * @param {JARS.internals.LoaderQueue.ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            var moduleDependencies = this;

            if(!moduleDependencies._abortCircular()) {
                new LoaderQueue(moduleDependencies._module, onModulesLoaded).loadModules(moduleDependencies.getAll());
            }
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
            var moduleDependencies = this,
                module = moduleDependencies._module,
                moduleName = module.name,
                dependencies = moduleDependencies.getAll(true),
                traceResult = defaultResult;

            traversedModules = traversedModules || {};

            if (hasOwnProp(traversedModules, moduleName)) {
                traceResult = resultOnMatch(moduleName);
            }
            else {
                traversedModules[moduleName] = true;

                arrayEach(dependencies, function findCircularDeps(dependencyName) {
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
        },
        /**
         * @private
         *
         * @return {boolean}
         */
        _abortCircular: function() {
            var moduleDependencies = this,
                module = moduleDependencies._module,
                hasCircularDependencies = !module.isRoot() && module.config.get('checkCircularDeps') && moduleDependencies.hasCircular();

            hasCircularDependencies && module.abort(moduleDependencies.getCircular());

            return hasCircularDependencies;
        }
    };

    /**
     * @memberof JARS.internals.ModuleDependencies
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
     * @memberof JARS.internals.ModuleDependencies
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
     * @memberof JARS.internals.ModuleDependencies
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
    * @typeDef {(string|JARS.internals.ModuleDependencies.Declaration[]|Object<string, JARS.internals.ModuleDependencies.Declaration>)} Declaration
    *
    * @memberof JARS.internals.ModuleDependencies
    */

    return ModuleDependencies;
});
