JARS.internal('Resolvers/PathList', function(getInternal) {
    'use strict';

    var Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        arrayEach = Utils.arrayEach,
        Loader = getInternal('Loader'),
        ModulesRegistry = getInternal('Registries/Modules'),
        PathResolver = getInternal('Resolvers/Path'),
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        cache = {
            sorted: {},

            excluded: ['*', 'System.*'],

            paths: []
        },
        PathListResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    PathListResolver = {
        /**
         * <p>Computes an array of paths for all the loaded modules
         * in the order they are dependending on each other.
         * This method can be used to create a custom build
         * preferable with a build tool and phantomjs.</p>
         *
         * <p>It is possible to recompute the list.
         * This is only for aesthetics.
         * Even without recomputation the list will still be valid.</p>
         *
         * @param {function(sting[])} callback
         * @param {boolean} forceRecompute
         */
        computeSortedPathList: function(callback, forceRecompute) {
            var modulesStillLoading = getModulesStillLoading();

            if(modulesStillLoading.length) {
                Loader.$import(modulesStillLoading, function computeSortedPathList() {
                    PathListResolver.computeSortedPathList(callback, forceRecompute);
                });
            }
            else {
                callback(computeModulesPathList(forceRecompute));
            }
        }
    };

    function getModulesStillLoading() {
        var modulesStillLoading = [];

        ModulesRegistry.each(function addModuleToLoad(module) {
            module.state.isLoading() && modulesStillLoading.push(module.name);
        });

        return modulesStillLoading;
    }

    /**
     * @memberof JARS.internals.PathResolver
     * @inner
     *
     * @param {string[]} modules
     */
    function addModules(modules, paths) {
        arrayEach(modules, function addModuleToPathList(moduleName) {
            addToPathList(ModulesRegistry.get(moduleName), paths, isBundle(moduleName));
        });
    }

    /**
     * @memberof JARS.internals.PathResolver
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param {boolean} [addBundle = false]
     */
    function addToPathList(module, paths, addBundle) {
        if (module.state.isLoaded()) {
            if (!hasOwnProp(cache.sorted, module.name)) {
                addModules(module.deps.getAll().concat(module.interceptionDeps.getAll()));
                cache.paths.push(PathResolver.getFullPath(module));
                cache.sorted[module.name] = true;
            }

            addBundle && addModules(module.bundle.modules);
        }
    }

    /**
     * @memberof JARS.internals.PathResolver
     * @inner
     */
    function computeModulesPathList(forceRecompute) {
        var paths = cache.paths;

        if (forceRecompute || !paths.length) {
            paths.length = 0;
            cache.sorted = {};

            markModulesSorted(cache.excluded);

            // TODO maybe start with entry module
            ModulesRegistry.each(function(module) {
                addToPathList(module, paths);
            });
        }

        return paths;
    }

    function markModulesSorted(modules) {
        arrayEach(modules, function markModuleSorted(excludedModule) {
            var module;

            cache.sorted[excludedModule] = true;

            if(isBundle(excludedModule)) {
                module = ModulesRegistry.get(excludedModule);
                cache.sorted[module.name] = true;
                markModulesSorted(module.bundle.modules);
            }
        });
    }

    return PathListResolver;
});
