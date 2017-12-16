JARS.internal('Resolvers/Path', function pathResolverSetup(getInternal) {
    'use strict';

    var Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        arrayEach = Utils.arrayEach,
        ModulesRegistry = getInternal('ModulesRegistry'),
        ExtensionTransform = getInternal('ConfigTransforms/Extension'),
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        pathOptions = ['basePath', 'dirPath', 'versionPath', 'fileName', 'minify', 'extension', 'cache'],
        sortedModules = {},
        excludedModules = [],
        pathList = [],
        PathManager;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    PathManager = {
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
            if (verifyModulesLoaded(callback, forceRecompute)) {
                if (forceRecompute || !pathList.length) {
                    resetModulesPathList();

                    ModulesRegistry.each(addToPathList);
                }

                callback(pathList);
            }
        },
        /**
         * @param {JARS.internals.Module} [module]
         * @param {string} [extension]
         *
         * @return {string}
         */
        getFullPath: function(module, extension) {
            var config = module.config,
                path = '';

            arrayEach(pathOptions, function(option) {
                path += (option === 'extension' && extension) ? ExtensionTransform(extension) : config.get(option);
            });

            return path;
        },

        excludeFromPathList: function(modules) {
            excludedModules = excludedModules.concat(modules);
        }
    };

    function verifyModulesLoaded(callback, forceRecompute) {
        var modulesToLoad = [];

        ModulesRegistry.each(function addModuleToLoad(module) {
            if (module.state.isLoading()) {
                modulesToLoad.push(module.name);
            }
        });

        if (modulesToLoad.length) {
            getInternal('Loader').$import(modulesToLoad, function computeSortedPathList() {
                PathManager.computeSortedPathList(callback, forceRecompute);
            });
        }

        return !modulesToLoad.length;
    }

    /**
     * @memberof JARS.internals.PathManager
     * @inner
     *
     * @param {string[]} [modules = []]
     */
    function addModules(modules) {
        arrayEach(modules || [], function addModuleToPathList(moduleName) {
            addToPathList(ModulesRegistry.get(moduleName), isBundle(moduleName));
        });
    }

    /**
     * @memberof JARS.internals.PathManager
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

                pathList.push(PathManager.getFullPath(module));
                sortedModules[moduleName] = true;
            }

            if (addBundle) {
                addModules(module.bundle.modules);
            }
        }
    }

    /**
     * @memberof JARS.internals.PathManager
     * @inner
     */
    function resetModulesPathList() {
        pathList = [];
        sortedModules = {};

        arrayEach(excludedModules, function markModuleSorted(excludedModule) {
            sortedModules[excludedModule] = true;
        });
    }

    return PathManager;
});
