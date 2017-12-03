JARS.internal('InternalBootstrapper', function internalBootstrapperSetup(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var InternalBootstrapper = {
        bootstrap: function(commands) {
            var EnvConfig = getInternal('EnvConfig'),
                ModulesRegistry = getInternal('ModulesRegistry'),
                GlobalConfig = getInternal('GlobalConfig');

            ModulesRegistry.init();

            GlobalConfig.update({
                modules: [{
                    basePath: EnvConfig.BASE_PATH,

                    cache: true,

                    minify: false,

                    timeout: 5
                }, {
                    restrict: 'System.*',

                    basePath: EnvConfig.INTERNALS_PATH
                }],

                interceptors: [
                    getInternal('PluginInterceptor'),
                    getInternal('PartialModuleInterceptor')
                ],

                globalAccess: false,

                loaderContext: 'default'
            });

            while(commands.length) {
                InternalBootstrapper.run(commands.shift());
            }
        },

        run: function(command) {
            var internal = getInternal(command[0]);

            internal[command[1]].apply(internal, command[2]);
        }
    };

    return InternalBootstrapper;
});
