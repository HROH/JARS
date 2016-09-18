JARS.internal('InternalBootstrapper', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        InternalBootstrapper;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    InternalBootstrapper = {
        bootstrap: function() {
            var SourceManager = getInternal('SourceManager'),
                System = getInternal('System'),
                Loader = getInternal('Loader'),
                ConfigsManager = getInternal('ConfigsManager');

            Loader.getRootModule().$export();

            Loader.registerModule('System', ['Logger', 'Modules']).$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough

                /**
                 * @global
                 * @module System
                 * @see JARS.internals.System
                 */
                return System;
            });

            ConfigsManager.update({
                modules: [{
                    basePath: SourceManager.BASE_PATH,

                    cache: true,

                    minified: false,

                    timeout: 5
                }, {
                    restrict: 'System.*',

                    basePath: SourceManager.INTERNALS_PATH
                }],

                interceptors: [
                    getInternal('PluginInterceptor'),
                    getInternal('PartialModuleInterceptor')
                ]
            });
        }
    };

    return InternalBootstrapper;
});
