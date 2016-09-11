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
        /**
         * @param {string} internalsPath
         */
        bootstrap: function(internalsPath) {
            var SourceManager = getInternal('SourceManager'),
                System = getInternal('System'),
                Loader = getInternal('Loader'),
                ConfigsManager = getInternal('ConfigsManager'),
                InterceptionManager = getInternal('InterceptionManager'),
                basePath = SourceManager.getBasePath();

            InterceptionManager.addInterceptor(getInternal('PluginInterceptor'));

            InterceptionManager.addInterceptor(getInternal('PartialModuleInterceptor'));

            Loader.registerModule(getInternal('Resolver').getRootName()).$export();

            Loader.registerModule('System', ['Logger', 'Modules']).$export(function systemFactory() {
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
        }
    };

    return InternalBootstrapper;
});
