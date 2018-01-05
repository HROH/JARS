JARS.internal('Bootstrappers/GlobalConfig', function globalConfigBootstrapperSetup(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var GlobalConfigBootstrapper = {
        bootstrap: function() {
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
            });
        }
    };

    return GlobalConfigBootstrapper;
});
