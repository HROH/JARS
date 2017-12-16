JARS.internal('Loader', function loaderSetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        GlobalConfig = getInternal('GlobalConfig'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        ModulesQueue = getInternal('ModulesQueue'),
        resolveDeps = getInternal('DependenciesResolver').resolveDeps,
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

            ModulesQueue.request({
                requestor: rootModule,

                modules: resolveDeps(rootModule, moduleNames),

                onModuleLoaded: onModuleImported || noop,

                onModuleAborted: onModuleAborted || noop,

                onModulesLoaded: function(refs) {
                    (onModulesImported || noop).apply(null, refs);
                }
            });
        }
    };

    function noop() {}

    return Loader;
});
