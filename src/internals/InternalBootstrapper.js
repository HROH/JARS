JARS.internal('InternalBootstrapper', function internalBootstrapperSetup(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var InternalBootstrapper = {
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
                ],

                globalAccess: false,

                supressErrors: false,

                loaderContext: 'default'
            });
        }
    };

    return InternalBootstrapper;
});
