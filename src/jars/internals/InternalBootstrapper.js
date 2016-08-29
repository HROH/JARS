JARS.internal('InternalBootstrapper', function(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        InternalBootstrapper;

    InternalBootstrapper = {
        bootstrap: function(internalsPath) {
            var SourceManager = getInternal('SourceManager'),
                System = getInternal('System'),
                Loader = getInternal('Loader'),
                ConfigsManager = getInternal('ConfigsManager'),
                InterceptionManager = getInternal('InterceptionManager'),
                basePath = SourceManager.getBasePath(),
                systemModule;

            InterceptionManager.addInterceptor(getInternal('PluginInterceptor'));

            InterceptionManager.addInterceptor(getInternal('PartialModuleInterceptor'));

            Loader.registerModule(getInternal('Resolver').getRootName()).$export();

            systemModule = Loader.registerModule('System', ['Logger', 'Modules']);

            systemModule.$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough
                return System;
            });

            ConfigsManager.update({
                modules: [{
                    basePath: basePath,

                    cache: true,

                    minified: false,

                    timeout: 5
                }, {
                    restrict: 'System.*',

                    basePath: basePath + internalsPath
                }]
            });

            systemModule.request(true);
        }
    };

    return InternalBootstrapper;
});
