/**
 * @module Modules
 */
JARS.module('System.Modules').meta({
    plugIn: function(pluginRequest) {
        pluginRequest.$export(function() {
            return pluginRequest.requestor.config.get('config');
        });
    }
}).$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var getInternal = InternalsRegistry.get,
        SubjectsRegistry = getInternal('Registries/Subjects'),
        getCurrent = getInternal('Helpers/Tracker').getCurrent,
        $import = getInternal('Handlers/Import').$import,
        PathResolver = getInternal('Resolvers/Path'),
        each = getInternal('Helpers/Array').each,
        Modules;

    /**
     * @namespace
     *
     * @memberof module:System
     *
     * @alias module:Modules
     *
     * @borrows JARS~internals.Handlers.Import.$import as $import
     */
    Modules = {
        /**
         * @param {JARS~internals.Subjects~Declaration} moduleNames
         *
         * @return {Array<*>}
         */
        useAll: function(moduleNames) {
            var refs = [];

            each(SubjectsRegistry.getRootModule().dependencies.resolve(moduleNames), function(subject) {
                refs.push(subject.ref.get());
            });

            return refs;
        },
        /**
         * @param {string} moduleName
         *
         * @return {*}
         */
        use: function(moduleName) {
            return Modules.useAll(moduleName)[0];
        },

        $import: $import,
        /**
         * @return {{moduleName: string, path: string}}
         */
        getCurrentModuleData: function() {
            //TODO
            var module = SubjectsRegistry.get(getCurrent());

            return {
                moduleName: module.name,

                path: PathResolver(module)
            };
        }
    };

    return Modules;
});
