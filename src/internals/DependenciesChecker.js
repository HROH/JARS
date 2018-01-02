JARS.internal('DependenciesChecker', function dependenciesCheckerSetup(getInternal) {
    'use strict';

    var getModule = getInternal('Registries/Modules').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        arrayEach = getInternal('Utils').arrayEach,
        CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = ' - found circular dependencies "${0}"',
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
         * @return {boolean}
         */
        abortIfCircular: function(module) {
            var circularDeps;

            if(!module.isRoot && module.config.get('checkCircularDeps')) {
                circularDeps = getCircularDeps(module);
                circularDeps && module.state.setAborted(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [circularDeps.join(CIRCULAR_SEPARATOR)]);
            }

            return !!circularDeps;
        }
    };

    /**
     * @memberof JARS.internals.DependenciesChecker
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param {JARS.internals.Module} [entryModule]
     *
     * @return {string[]}
     */
    function getCircularDeps(module, entryModule) {
        return (entryModule === module) ? [module.name] : getCircularDepsModule(module, entryModule);
    }

    function getCircularDepsModule(module, entryModule) {
        return module.state.isRegistered() && getCircularDepsEach(module.deps.getAll().concat(module.interceptionDeps.getAll()), entryModule || module, module);
    }

    function getCircularDepsBundle(bundle, entryModule) {
        return getCircularDepsEach(bundle.modules, entryModule, bundle);
    }

    function getCircularDepsEach(modules, entryModule, owner) {
        var circularDeps;

        arrayEach(modules, function getCircularDepsFor(moduleName) {
            var depModule = getModule(moduleName);

            circularDeps = isBundle(moduleName) ? getCircularDepsBundle(depModule.bundle, entryModule) : getCircularDeps(depModule, entryModule);

            return circularDeps;
        });

        circularDeps && circularDeps.unshift(owner.name);

        return circularDeps;
    }

    return DependenciesChecker;
});
