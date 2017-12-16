JARS.internal('InternalBootstrapper', function internalBootstrapperSetup(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var InternalBootstrapper = {
        bootstrap: function(commands) {
            var ModulesRegistry = getInternal('ModulesRegistry'),
                systemModule;

            ModulesRegistry.init();

            getInternal('GlobalConfig').update({
                modules: {
                    basePath: getInternal('Env').BASE_PATH,

                    cache: true,

                    minify: false,

                    timeout: 5
                },

                interceptors: [
                    getInternal('PluginInterceptor'),
                    getInternal('PartialModuleInterceptor')
                ],

                globalAccess: false,

                loaderContext: 'default'
            });

            systemModule = getInternal('SystemBootstrapper').bootstrap();

            getInternal('Resolvers/Path').excludeFromPathList([ModulesRegistry.getRoot().name, systemModule.name].concat(systemModule.bundle.modules));

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
