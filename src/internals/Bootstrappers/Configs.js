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
            var Env = getInternal('Env');

            getInternal('Configs/Global').update({
                modules: [{
                    basePath: Env.BASE_PATH,

                    cache: true,

                    scope: 'default',

                    minify: false,

                    timeout: 5
                }, {
                    restrict: 'System.*',

                    basePath: Env.INTERNALS_PATH
                }],

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
