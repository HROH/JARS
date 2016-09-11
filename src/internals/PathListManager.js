JARS.internal('PathListManager', function pathListManagerSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        utils = getInternal('utils'),
        hasOwnProp = utils.hasOwnProp,
        arrayEach = utils.arrayEach,
        Loader = getInternal('Loader'),
        Resolver = getInternal('Resolver'),
        excludedModules = [Resolver.getRootName(), 'System', 'System.Logger', 'System.Modules'],
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

            Loader.eachModules(function addModuleToLoad(module) {
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

                    Loader.eachModules(addToPathList);
                }

                callback(pathList);
            }
        }
    };

    /**
     * @private
     *
     * @memberof JARS.internals.PathListManager
     *
     * @param {string[]} [modules = []]
     */
    function addModules(modules) {
        arrayEach(modules || [], function addModuleToPathList(moduleName) {
            addToPathList(Loader.getModule(moduleName), Resolver.isBundle(moduleName));
        });
    }

    /**
     * @private
     *
     * @memberof JARS.internals.PathListManager
     *
     * @param {JARS.internals.Module} module
     * @param {boolean} [addBundle = false]
     */
    function addToPathList(module, addBundle) {
        var moduleName = module.name,
            dependencies = module.deps.getAll(true);

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
     * @private
     *
     * @memberof JARS.internals.PathListManager
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
