JARS.internal('Loader', function loaderSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        ModulesQueue = getInternal('ModulesQueue'),
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
            ModulesRegistry.each(function flushModule(module) {
                module.flush(loaderContext);
            });

            System.Logger.info('Successfully flushed Loader with context "${0}"', [loaderContext]);

            getInternal('GlobalConfig').update('loaderContext', switchToContext);
        },
        /**
         * @param {string} newLoaderContext
         */
        setLoaderContext: function(newLoaderContext) {
            currentLoaderContext = newLoaderContext;
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} moduleNames
         * @param {function(...*)} onModulesImported
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleImported
         */
        $import: function(moduleNames, onModulesImported, onModuleAborted, onModuleImported) {
            var rootModule = ModulesRegistry.getRoot();

            new ModulesQueue(rootModule, DependenciesResolver.resolveDeps(rootModule, moduleNames)).request(function onModulesLoaded(refs) {
                onModulesImported.apply(null, refs);
            }, onModuleImported, onModuleAborted);
        }
    };

    ModulesRegistry.getRoot().$export();
    ModulesRegistry.setCurrent();

    return Loader;
});
