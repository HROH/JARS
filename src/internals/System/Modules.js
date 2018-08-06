/**
 * @module Modules
 */
JARS.module('System.Modules').meta({
    plugIn: function(pluginRequest, getInternal) {
        'use strict';

        var CONFIG = getInternal('Configs/Options').CONFIG;

        pluginRequest.$export(function() {
            return pluginRequest.requestor.config.get(CONFIG);
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
         * @param {JARS~internals.Subjects~Declaration} subjectNames
         * @param {string} [scope]
         *
         * @return {Array<*>}
         */
        useAll: function(subjectNames, scope) {
            var refs = [];

            each(SubjectsRegistry.getRootModule().dependencies.resolve(subjectNames), function(subject) {
                refs.push(subject.ref.get(scope));
            });

            return refs;
        },
        /**
         * @param {string} subjectName
         * @param {string} [scope]
         *
         * @return {*}
         */
        use: function(subjectName, scope) {
            return Modules.useAll(subjectName, scope)[0];
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
