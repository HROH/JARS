JARS.internal('Loader', function loaderSetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        GlobalConfig = getInternal('GlobalConfig'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        ModulesQueue = getInternal('ModulesQueue'),
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

            switchToContext && GlobalConfig.update('loaderContext', switchToContext);
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} moduleNames
         * @param {function(...*)} onModulesImported
         * @param {JARS.internals.ModulesQueue.ModuleAbortedCallback} onModuleAborted
         * @param {JARS.internals.ModulesQueue.ModuleLoadedCallback} onModuleImported
         */
        $import: function(moduleNames, onModulesImported, onModuleAborted, onModuleImported) {
            var rootModule = ModulesRegistry.getRoot();

            new ModulesQueue(rootModule, DependenciesResolver.resolveDeps(rootModule, moduleNames)).request(function onModulesLoaded(refs) {
                onModulesImported.apply(null, refs);
            }, onModuleAborted, onModuleImported);
        }
    };

    return Loader;
});
