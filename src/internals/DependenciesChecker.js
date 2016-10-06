JARS.internal('DependenciesChecker', function dependenciesCheckerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        ModulesRegistry = getInternal('ModulesRegistry'),
        Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        arrayEach = Utils.arrayEach,
        DependenciesChecker,
        GetCircularDepsCollector,
        HasCircularDepsCollector;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    DependenciesChecker = {
        /**
         * @param {JARS.internals.Module} module
         *
         * @return {string[]}
         */
        getCircular: function(module) {
            return traceCircular(module, GetCircularDepsCollector, []);
        },
        /**
         * @param {JARS.internals.Module} module
         *
         * @return {boolean}
         */
        hasCircular: function(module) {
            return !module.isRoot && module.config.get('checkCircularDeps') && traceCircular(module, HasCircularDepsCollector, false);
        }
    };

    /**
     * @memberof JARS.internals.DependenciesChecker
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param {Object} collector
     * @param {*} traceResult
     * @param {Object<string, string>} [traversedModules]
     *
     * @return {*}
     */
    function traceCircular(module, collector, traceResult, traversedModules) {
        var moduleName = module.name,
            dependencyModules = module.deps.getAll().concat(module.interceptionDeps.getAll());

        traversedModules = traversedModules || {};

        if (hasOwnProp(traversedModules, moduleName)) {
            traceResult = collector.match(moduleName);
        }
        else {
            traversedModules[moduleName] = true;

            arrayEach(dependencyModules, function findCircularDeps(dependencyName) {
                var tmpResult = traceCircular(ModulesRegistry.get(dependencyName), collector, traceResult, traversedModules);

                tmpResult = collector.loopMatch(tmpResult, moduleName);

                if(tmpResult) {
                    traceResult = tmpResult;

                    return true;
                }
            });

            delete traversedModules[moduleName];
        }

        return traceResult;
    }

    /**
     * @namespace
     *
     * @memberof JARS.internals.DependenciesChecker
     * @inner
     */
    GetCircularDepsCollector = {
        /**
         * @param {string} match
         *
         * @return {string[]}
         */
        match: function(match) {
            return [match];
        },
        /**
         * @param {string[]} result
         * @param {string} match
         *
         * @return {string[]}
         */
        recursiveMatch: function(result, match) {
            if(result.length) {
                result.unshift(match);

                return result;
            }
        }
    };

    /**
     * @namespace
     *
     * @memberof JARS.internals.DependenciesChecker
     * @inner
     */
    HasCircularDepsCollector = {
        /**
         * @param {string} match
         *
         * @return {boolean}
         */
        match: function(match) {
            return !!match;
        },
        /**
         * @param {boolean} result
         *
         * @return {boolean}
         */
        recursiveMatch: function(result) {
            return !!result;
        }
    };

    return DependenciesChecker;
});
