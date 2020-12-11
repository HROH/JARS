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
        Injector = getInternal('Registries/Injector'),
        getCurrent = getInternal('Helpers/Tracker').getCurrent,
        AnonymousHandler = getInternal('Handlers/Anonymous'),
        request = getInternal('Handlers/Modules').request,
        PathResolver = getInternal('Resolvers/Path'),
        reduce = getInternal('Helpers/Array').reduce,
        Modules;

    /**
     * @namespace
     *
     * @memberof module:System
     *
     * @alias module:Modules
     */
    Modules = {
        /**
         * @param {JARS~internals.Subjects~Declaration} subjectNames
         * @param {string} [scope]
         *
         * @return {Array<*>}
         */
        useAll: function(subjectNames, scope) {
            return reduce(Injector.getRootModule().dependencies.resolve(subjectNames), function(refs, subject) {
                refs.push(subject.ref.get(scope));

                return refs;
            }, []);
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
        /**
         * @memberof JARS~internals.Handlers
         *
         * @param {JARS~internals.Subjects~Declaration} moduleNames
         * @param {function(...*)} [onCompleted]
         * @param {function(string)} [onAborted]
         * @param {function(string)} [onLoaded]
         *
         * @return {JARS~internals.Handlers.Subject}
         */
        $import: function(moduleNames, onCompleted, onAborted, onLoaded) {
            request(AnonymousHandler(moduleNames, onCompleted, onAborted, onLoaded));
        },
        /**
         * @return {{name: string, path: string, logger: JARS~internals.Logger.Logger}}
         */
        getCurrentData: function() {
            var subject = Injector.getSubject(getCurrent());

            return {
                name: subject.name,

                path: PathResolver(subject),

                logger: subject.logger
            };
        }
    };

    return Modules;
});
