JARS.internal('DependenciesChecker', function dependenciesCheckerSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('ModulesRegistry'),
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
            return (!module.isRoot && module.config.get('checkCircularDeps')) ? getCircularDependencies(module) : [];
        }
    };

    /**
     * @memberof JARS.internals.DependenciesChecker
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param {Object<string, string>} [traversedModules]
     *
     * @return {*}
     */
    function getCircularDependencies(module, traversedModules) {
        var moduleName = module.name,
            dependencyModules = module.deps.getAll().concat(module.interceptionDeps.getAll()),
            circularDependencies;

        traversedModules = traversedModules || {};

        if (hasOwnProp(traversedModules, moduleName)) {
            circularDependencies = [moduleName];
        }
        else {
            traversedModules[moduleName] = true;

            arrayEach(dependencyModules, function findCircularDeps(dependencyName) {
                circularDependencies = getCircularDependencies(ModulesRegistry.get(dependencyName), traversedModules);

                if(circularDependencies.length) {
                    circularDependencies.unshift(moduleName);

                    return true;
                }
            });

            delete traversedModules[moduleName];
        }

        return circularDependencies || [];
    }

    return DependenciesChecker;
});
