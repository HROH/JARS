JARS.internal('PathListManager', function pathListManagerSetup(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        hasOwnProp = utils.hasOwnProp,
        arrayEach = utils.arrayEach,
        Loader = InternalsManager.get('Loader'),
        Resolver = InternalsManager.get('Resolver'),
        excludedModules = [Resolver.getRootName(), 'System', 'System.Logger', 'System.Modules'],
        sortedModules = {},
        pathList = [],
        PathListManager;

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
         * @access public
         *
         * @memberof JARS~PathListManager
         *
         * @param {Function(array)} callback
         * @param {Boolean} forceRecompute
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
     * @access private
     *
     * @memberof JARS~PathListManager
     * @inner
     *
     * @param {Array} [modules = []]
     */
    function addModules(modules) {
        arrayEach(modules || [], function addModuleToPathList(moduleName) {
            addToPathList(Loader.getModule(moduleName), Resolver.isBundle(moduleName));
        });
    }

    /**
     * @access private
     *
     * @memberof JARS~PathListManager
     * @inner
     *
     * @param {JARS~Module} module
     * @param {Boolean} [addBundle = false]
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
     * @access private
     *
     * @memberof JARS~PathListManager
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