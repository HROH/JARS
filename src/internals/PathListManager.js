JARS.internal('PathListManager', function pathListManagerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        arrayEach = Utils.arrayEach,
        Loader = getInternal('Loader'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        BundleResolver = getInternal('BundleResolver'),
        excludedModules = [ModulesRegistry.getRoot().name, 'System', 'System.Logger', 'System.Modules'],
        sortedModules = {},
        pathList = [],
        PathListManager;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    PathListManager = {
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
            var modulesToLoad = [],
                modulesLoading = false;

            ModulesRegistry.each(function addModuleToLoad(module) {
                if (module.state.isLoading()) {
                    modulesToLoad.push(module.name);
                    modulesLoading = true;
                }
            });

            if (modulesLoading) {
                Loader.$import(modulesToLoad, function computeSortedPathList() {
                    PathListManager.computeSortedPathList(callback, forceRecompute);
                });
            }
            else {
                if (forceRecompute || !pathList.length) {
                    resetModulesPathList();

                    ModulesRegistry.each(addToPathList);
                }

                callback(pathList);
            }
        }
    };

    /**
     * @memberof JARS.internals.PathListManager
     * @inner
     *
     * @param {string[]} [modules = []]
     */
    function addModules(modules) {
        arrayEach(modules || [], function addModuleToPathList(moduleName) {
            addToPathList(ModulesRegistry.get(moduleName), BundleResolver.isBundle(moduleName));
        });
    }

    /**
     * @memberof JARS.internals.PathListManager
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param {boolean} [addBundle = false]
     */
    function addToPathList(module, addBundle) {
        var moduleName = module.name,
            dependencies = module.deps.getAll().concat(module.interceptionDeps.getAll());

        if (module.state.isLoaded()) {
            if (!hasOwnProp(sortedModules, moduleName)) {
                addModules(dependencies);

                pathList.push(module.getFullPath());
                sortedModules[moduleName] = true;
            }

            if (addBundle) {
                addModules(module.bundle);
            }
        }
    }

    /**
     * @memberof JARS.internals.PathListManager
     * @inner
     */
    function resetModulesPathList() {
        pathList = [];
        sortedModules = {};

        arrayEach(excludedModules, function markModuleSorted(excludedModule) {
            sortedModules[excludedModule] = true;
        });
    }

    return PathListManager;
});
