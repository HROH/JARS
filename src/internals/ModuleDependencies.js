JARS.internal('ModuleDependencies', function moduleDependenciesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        arrayEach = getInternal('utils').arrayEach,
        hasOwnProp = getInternal('utils').hasOwnProp,
        Resolver = getInternal('Resolver'),
        LoaderQueue = getInternal('LoaderQueue'),
        SEPARATOR = '", "',
        FOUND = 'found ',
        MSG_DEPENDENCY_FOUND = FOUND + 'implicit dependency "${dep}"',
        MSG_DEPENDENCIES_FOUND = FOUND + 'explicit dependencie(s) "${deps}"',
        MSG_INTERCEPTION_DEPENDENCIES_FOUND = FOUND + 'interception dependencie(s) "${deps}"';

    /**
     * @access public
     *
     * @constructor ModuleDependencies
     *
     * @memberof JARS
     * @inner
     *
     * @param {JARS~Module} module
     * @param {JARS~ModuleLogger} logger
     */
    function ModuleDependencies(module, logger) {
        var moduleDependencies = this,
            parent;

        moduleDependencies._module = module;
        moduleDependencies._logger = logger;
        moduleDependencies._deps = [];

        moduleDependencies._interceptionDeps = [];

        if(!module.isRoot()) {
            parent = moduleDependencies.parent = module.loader.getModule(Resolver.getImplicitDependencyName(module.name) || Resolver.getRootName());

            logger.debug(MSG_DEPENDENCY_FOUND, {
                dep: parent.name
            });
        }
    }

    ModuleDependencies.prototype = {
        /**
         * @access public
         *
         * @alias JARS~ModuleDependencies
         *
         * @memberof JARS~ModuleDependencies#
         */
        constructor: ModuleDependencies,
        /**
         * @access public
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @param {Boolean} getInterceptionDeps
         *
         * @return {String[]}
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
         * @access public
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @param {JARS~ModuleDependencies~Declaration} dependencies
         * @param {Boolean} [addInterceptionDependencies]
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
                dependencies = Resolver.resolve(dependencies, moduleDependencies._module.name);
            }

            dependencies.length && moduleDependencies._logger.debug(message, {
                deps: dependencies.join(SEPARATOR)
            });

            moduleDependencies[depsKey] = moduleDependencies[depsKey].concat(dependencies);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @param {JARS~ModuleDependencies~Declaration} interceptionDependencies
         * @param {JARS~LoaderQueue~ModulesLoadedCallback} onModulesLoaded
         * @param {JARS~ModuleQueue~FailCallback} onModuleAborted
         * @param {JARS~LoaderQueue~ModuleLoadedCallback} onModuleLoaded
         */
        requestAndLink: function(interceptionDependencies, onModulesLoaded, onModuleAborted, onModuleLoaded) {
            var moduleDependencies = this;

            moduleDependencies.add(interceptionDependencies, true);

            if(!moduleDependencies._abortCircular()) {
                new LoaderQueue(moduleDependencies._module, onModulesLoaded, onModuleLoaded, onModuleAborted).loadModules(interceptionDependencies);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @param {JARS~LoaderQueue~ModulesLoadedCallback} onModulesLoaded
         */
        request: function(onModulesLoaded) {
            var moduleDependencies = this;

            if(!moduleDependencies._abortCircular()) {
                new LoaderQueue(moduleDependencies._module, onModulesLoaded).loadModules(moduleDependencies.getAll());
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @return {Boolean}
         */
        hasCircular: function() {
            return this._traceCircular(false, foundMatch, foundMatch);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @return {String[]}
         */
        getCircular: function() {
            return this._traceCircular([], returnMatch, addCurrentToMatchListAndReturn);
        },
        /**
         * @access private
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @param {*} defaultResult
         * @param {Function(String)} resultOnMatch
         * @param {Function(*, String)} resultOnLoopMatch
         * @param {Object} [traversedModules]
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
         * @access private
         *
         * @memberof JARS~ModuleDependencies#
         *
         * @return {Boolean}
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
     * @access private
     *
     * @memberof JARS~ModuleDependencies
     *
     * @param {String} matchingModuleName
     *
     * @return {String[]}
     */
    function returnMatch(matchingModuleName) {
        return [matchingModuleName];
    }

    /**
     * @access private
     *
     * @memberof JARS~ModuleDependencies
     *
     * @param {String[]} result
     * @param {String} matchingModuleName
     *
     * @return {String[]}
     */
    function addCurrentToMatchListAndReturn(result, matchingModuleName) {
        if(result.length) {
            result.unshift(matchingModuleName);

            return result;
        }
    }

    /**
     * @access private
     *
     * @memberof JARS~ModuleDependencies
     *
     * @param {(String|String[])} match
     *
     * @return {Boolean}
     */
    function foundMatch(match) {
        return !!match;
    }

   /**
    * @typeDef {(String|JARS~ModuleDependencies~Declaration[]|Object<String, JARS~ModuleDependencies~Declaration>)} Declaration
    *
    * @memberof JARS~ModuleDependencies
    * @inner
    */

    return ModuleDependencies;
});
