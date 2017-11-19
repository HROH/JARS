JARS.internal('DependenciesChecker', function dependenciesCheckerSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesCollectorGetCircular = getInternal('DependenciesCollectorGetCircular'),
        DependenciesCollectorHasCircular = getInternal('DependenciesCollectorHasCircular'),
        Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        arrayEach = Utils.arrayEach,
        DependenciesChecker;

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
            return traceCircular(module, DependenciesCollectorGetCircular, []);
        },
        /**
         * @param {JARS.internals.Module} module
         *
         * @return {boolean}
         */
        hasCircular: function(module) {
            return !module.isRoot && module.config.get('checkCircularDeps') && traceCircular(module, DependenciesCollectorHasCircular, false);
        }
    };

    /**
     * @memberof JARS.internals.DependenciesChecker
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param {JARS.internals.DependenciesChecker.Collector} collector
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

                tmpResult = collector.recursiveMatch(tmpResult, moduleName);

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
     * @interface JARS.internals.DependenciesChecker.Collector
     */

    /**
     * @method match
     *
     * @memberof JARS.internals.DependenciesChecker.Collector#
     *
     * @param {string} match
     *
     * @return {*}
     */

    /**
     * @method recursiveMatch
     *
     * @memberof JARS.internals.DependenciesChecker.Collector#
     *
     * @param {*} result
     * @param {string} match
     *
     * @return {*}
     */

    return DependenciesChecker;
});
