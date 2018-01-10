JARS.internal('Handlers/Import', function(getInternal) {
    'use strict';

    var resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        getRootModule = getInternal('Registries/Modules').getRoot;

    /**
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} moduleNames
     * @param {function(...*)} onModulesLoaded
     * @param {function()} onModuleAborted
     * @param {function()} onModuleLoaded
     */
    function Import(moduleNames, onModulesLoaded, onModuleAborted, onModuleLoaded) {
        var rootModule = getRootModule();
        
        return {
            requestor: rootModule,

            modules: resolveDeps(rootModule, moduleNames),

            onModuleLoaded: onModuleLoaded || noop,

            onModuleAborted: onModuleAborted || noop,

            onModulesLoaded: function(refs) {
                (onModulesLoaded || noop).apply(null, refs.get());
            }
        };
    }

    /**
     * @memberof JARS~internals.Handlers.Import
     * @inner
     */
    function noop() {}

    return Import;
});
