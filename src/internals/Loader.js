JARS.internal('Loader', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        GlobalConfig = getInternal('GlobalConfig'),
        ModulesRegistry = getInternal('Registries/Modules'),
        Modules = getInternal('Handlers/Modules'),
        resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        Loader;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     */
    Loader = {
        /**
         * @param {string} context
         * @param {string} switchToContext
         */
        flush: function(context, switchToContext) {
            ModulesRegistry.each(function flushModule(module) {
                module.ref.flush(context);
            });

            System.Logger.info('Successfully flushed modules with context "${0}"', [context]);

            switchToContext && GlobalConfig.update('loaderContext', switchToContext);
        },
        /**
         * @param {JARS~internals.Dependencies~Declaration} moduleNames
         * @param {function(...*)} onModulesImported
         * @param {function()} onModuleAborted
         * @param {function()} onModuleImported
         */
        $import: function(moduleNames, onModulesImported, onModuleAborted, onModuleImported) {
            var rootModule = ModulesRegistry.getRoot();

            Modules.request({
                requestor: rootModule,

                modules: resolveDeps(rootModule, moduleNames),

                onModuleLoaded: onModuleImported || noop,

                onModuleAborted: onModuleAborted || noop,

                onModulesLoaded: function(refs) {
                    (onModulesImported || noop).apply(null, refs.get());
                }
            });
        }
    };

    /**
     * @memberof JARS~internals.Loader
     * @inner
     */
    function noop() {}

    return Loader;
});
