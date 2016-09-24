JARS.internal('Loader', function loaderSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        objectEach = getInternal('Utils').objectEach,
        System = getInternal('System'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        BundleResolver = getInternal('BundleResolver'),
        Module = getInternal('Module'),
        LoaderQueue = getInternal('LoaderQueue'),
        InterceptionManager = getInternal('InterceptionManager'),
        modulesRegistry = {},
        ROOT_MODULE_NAME = '*',
        currentModuleName = ROOT_MODULE_NAME,
        currentLoaderContext = 'default',
        Loader;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    Loader = {
        /**
         * @param {string} loaderContext
         * @param {string} switchToContext
         */
        flush: function(loaderContext, switchToContext) {
            // TODO remove refs in modules with given loaderContext
            Loader.eachModules(function flushModule(module) {
                module.flush(loaderContext);
            });

            System.Logger.info('Successfully flushed Loader with context "${0}"', [loaderContext]);

            getInternal('ConfigsManager').update('loaderContext', switchToContext);
        },
        /**
         * @param {string} newLoaderContext
         */
        setLoaderContext: function(newLoaderContext) {
            currentLoaderContext = newLoaderContext;
        },
        /**
         * @param {string} moduleName
         */
        setCurrentModuleName: function(moduleName) {
            currentModuleName = moduleName || ROOT_MODULE_NAME;
        },
        /**
         * @return {{moduleName: string, path: string}}
         */
        getCurrentModuleData: function() {
            var moduleName = currentModuleName,
                module = Loader.getModule(moduleName);

            return {
                moduleName: moduleName,

                path: module.getFullPath()
            };
        },
        /**
         * @return {Object}
         */
        getRootModule: function() {
            return Loader.getModule(ROOT_MODULE_NAME, true);
        },
        /**
         * @param {string} moduleName
         *
         * @return {*}
         */
        getModuleRef: function(moduleName) {
            return Loader.getModule(moduleName).ref;
        },
        /**
         * @param {string} moduleName
         * @param {boolean} [isRoot]
         *
         * @return {JARS.internals.Module}
         */
        getModule: function(moduleName, isRoot) {
            if (BundleResolver.isBundle(moduleName)) {
                moduleName = BundleResolver.removeBundle(moduleName);
            }
            else {
                moduleName = InterceptionManager.removeInterceptionData(moduleName);
            }

            return moduleName ? modulesRegistry[moduleName] || (modulesRegistry[moduleName] = new Module(Loader, moduleName, isRoot)) : null;
        },
        /**
         * @param {function(JARS.internals.Module, string)} callback
         */
        eachModules: function(callback) {
            objectEach(modulesRegistry, callback);
        },
        /**
         * @param {string} moduleName
         * @param {JARS.internals.ModuleBundle.Declaration} bundleModules
         *
         * @return {JARS.internals.Module}
         */
        registerModule: function(moduleName, bundleModules) {
            var module = Loader.getModule(moduleName);

            if(module) {
                module.bundle.add(bundleModules);
            }
            else {
                System.Logger.error('No modulename provided');
            }

            return module;
        },
        /**
         * @param {JARS.internals.ModuleDependencies.Declaration} moduleNames
         * @param {function(...*)} onModulesImported
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         * @param {JARS.internals.LoaderQueue.ModuleLoadedCallback} onModuleImported
         */
        $import: function(moduleNames, onModulesImported, onModuleAborted, onModuleImported) {
            var rootModule = Loader.getRootModule();

            new LoaderQueue(rootModule, function onModulesLoaded(refs) {
                onModulesImported.apply(null, refs);
            }, onModuleImported, onModuleAborted).loadModules(DependenciesResolver.resolveDeps(rootModule, moduleNames));
        }
    };

    return Loader;
});
