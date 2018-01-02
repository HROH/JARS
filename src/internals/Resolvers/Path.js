JARS.internal('Resolvers/Path', function pathResolverSetup(getInternal) {
    'use strict';

    var Utils = getInternal('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        arrayEach = Utils.arrayEach,
        ModulesRegistry = getInternal('Registries/Modules'),
        ExtensionTransform = getInternal('ConfigTransforms/Extension'),
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        pathOptions = ['basePath', 'dirPath', 'versionPath', 'fileName', 'minify', 'extension', 'cache'],
        cache = {
            sorted: {},

            excluded: [],

            paths: []
        },
        PathResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    PathResolver = {
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
                getInternal('Loader').$import(modulesStillLoading, function computeSortedPathList() {
                    PathResolver.computeSortedPathList(callback, forceRecompute);
                });
            }
            else {
                callback(computeModulesPathList(forceRecompute));
            }
        },
        /**
         * @param {JARS.internals.Module} [module]
         * @param {string} [extension]
         *
         * @return {string}
         */
        getFullPath: function(module, extension) {
            var path = '';

            arrayEach(pathOptions, function(option) {
                path += (option === 'extension' && extension) ? ExtensionTransform(extension) : module.config.get(option);
            });

            return path;
        },

        excludeFromPathList: function(modules) {
            cache.excluded = cache.excluded.concat(modules);
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

            arrayEach(cache.excluded, function markModuleSorted(excludedModule) {
                cache.sorted[excludedModule] = true;
            });

            // TODO maybe start with entry module
            ModulesRegistry.each(function(module) {
                addToPathList(module, paths);
            });
        }

        return paths;
    }

    return PathResolver;
});
