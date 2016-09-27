JARS.internal('InternalBootstrapper', function internalBootstrapperSetup(InternalsManager) {
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
                ModulesRegistry = getInternal('ModulesRegistry'),
                GlobalConfig = getInternal('GlobalConfig');

            ModulesRegistry.init();

            GlobalConfig.update({
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
