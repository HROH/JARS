/**
 * @module System.Modules
 * @see JARS~internals.System.Modules
 */
JARS.module('System.Modules').$export(function systemModulesFactory() {
    'use strict';

    var getInternal = this.$$internals.get,
        Loader = getInternal('Loader'),
        ModulesRegistry = getInternal('Registries/Modules'),
        DependenciesResolver = getInternal('Resolvers/Dependencies'),
        getFullPath = getInternal('Resolvers/Path').getFullPath,
        each = getInternal('Helpers/Array').each,
        Modules;

    /**
     * @namespace
     *
     * @memberof JARS~internals.System
     *
     * @borrows JARS~internals.Loader.$import as $import
     */
    Modules = {
        /**
         * @param {JARS~internals.Dependencies.Declaration} moduleNames
         *
         * @return {Array<*>}
         */
        useAll: function(moduleNames) {
            var refs = [];

            moduleNames = DependenciesResolver.resolveDeps(ModulesRegistry.getRoot(), moduleNames);

            each(moduleNames, function use(moduleName) {
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
