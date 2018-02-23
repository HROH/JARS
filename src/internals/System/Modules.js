/**
 * @module Modules
 */
JARS.module('System.Modules').$export(function() {
    'use strict';

    var getInternal = this.$$internals.get,
        ModulesRegistry = getInternal('Registries/Modules'),
        $import = getInternal('Handlers/Modules').$import,
        resolveDeps = getInternal('Resolvers/Dependencies').resolveDeps,
        getFullPath = getInternal('Resolvers/Path').getFullPath,
        each = getInternal('Helpers/Array').each,
        Modules;

    /**
     * @namespace
     *
     * @memberof module:System
     *
     * @alias module:Modules
     *
     * @borrows JARS~internals.Handlers.Modules.$import as $import
     */
    Modules = {
        /**
         * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} moduleNames
         *
         * @return {Array<*>}
         */
        useAll: function(moduleNames) {
            var refs = [];

            moduleNames = resolveDeps(ModulesRegistry.getRoot(), moduleNames);

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
            return ModulesRegistry.get(moduleName).ref.get();
        },

        $import: $import,
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
