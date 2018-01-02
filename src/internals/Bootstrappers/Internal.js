JARS.internal('Bootstrappers/Internal', function internalBootstrapperSetup(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var InternalBootstrapper = {
        bootstrap: function(commands) {
            var ModulesRegistry = getInternal('Registries/Modules'),
                systemModule;

            ModulesRegistry.init();

            getInternal('GlobalConfig').update({
                modules: {
                    basePath: getInternal('Env').BASE_PATH,

                    cache: true,

                    context: 'default',

                    minify: false,

                    timeout: 5
                },

                interceptors: [
                    getInternal('Interceptors/Plugin'),
                    getInternal('Interceptors/Property')
                ],

                globalAccess: false,

                loaderContext: 'default'
            });

            systemModule = getInternal('Bootstrappers/System').bootstrap();

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
