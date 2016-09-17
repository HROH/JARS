/**
 * @module System.Modules
 * @see JARS.internals.System.Modules
 */
JARS.module('System.Modules').$export(function systemModulesFactory() {
    'use strict';

    var internals = this.$$internals,
        getInternal = internals.get,
        arrayEach = getInternal('Utils').arrayEach,
        Loader = getInternal('Loader'),
        Resolver = getInternal('Resolver'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        Modules;

    /**
     * @namespace
     *
     * @memberof JARS.internals.System
     *
     * @borrows JARS.internals.Loader.getModuleRef as use
     * @borrows JARS.internals.Loader.$import as $import
     * @borrows JARS.internals.Loader.getCurrentModuleData as getCurrentModuleData
     */
    Modules = {
        /**
         * @param {JARS.internals.ModuleDependencies.Declaration} moduleNames
         *
         * @return {Array<*>}
         */
        useAll: function(moduleNames) {
            var refs = [];

            moduleNames = DependenciesResolver.resolveDeps(Loader.getModule(Resolver.getRootName()), moduleNames);

            arrayEach(moduleNames, function use(moduleName) {
                refs.push(Modules.use(moduleName));
            });

            return refs;
        },

        use: Loader.getModuleRef,

        $import: Loader.$import,

        getCurrentModuleData: Loader.getCurrentModuleData
    };

    return Modules;
});
