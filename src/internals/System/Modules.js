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
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = getInternal('Resolvers/Dependencies'),
        getFullPath = getInternal('Resolvers/Path').getFullPath,
        Modules;

    /**
     * @namespace
     *
     * @memberof JARS.internals.System
     *
     * @borrows JARS.internals.Loader.$import as $import
     */
    Modules = {
        /**
         * @param {JARS.internals.Dependencies.Declaration} moduleNames
         *
         * @return {Array<*>}
         */
        useAll: function(moduleNames) {
            var refs = [];

            moduleNames = DependenciesResolver.resolveDeps(ModulesRegistry.getRoot(), moduleNames);

            arrayEach(moduleNames, function use(moduleName) {
                refs.push(Modules.use(moduleName));
            });

            return refs;
        },
        /**
         * @param {string} moduleName
         *
         * @return {*}
         */
        use: function(moduleName) {
            return ModulesRegistry.get(moduleName).ref;
        },

        $import: Loader.$import,
        /**
         * @return {{moduleName: string, path: string}}
         */
        getCurrentModuleData: function() {
            var module = ModulesRegistry.getCurrent();

            return {
                moduleName: module.name,

                path: getFullPath(module)
            };
        }
    };

    return Modules;
});
