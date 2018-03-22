JARS.internal('Bootstrappers/Configs', function(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Bootstrappers
     */
    var Configs = {
        /**
         * @method
         */
        bootstrap: function() {
            getInternal('Configs/Global').update({
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

                globalAccess: false
            });
        }
    };

    return Configs;
});
