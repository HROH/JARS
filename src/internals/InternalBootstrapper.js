JARS.internal('InternalBootstrapper', function internalBootstrapperSetup(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var InternalBootstrapper = {
        bootstrap: function(commands) {
            var Env = getInternal('Env'),
                ModulesRegistry = getInternal('ModulesRegistry'),
                GlobalConfig = getInternal('GlobalConfig'),
                System = getInternal('System'),
                SYSTEM_CONFIG = {
                    restrict: 'System.*',

                    basePath: Env.INTERNALS_PATH
                },
                SYSTEM_NAME = 'System',
                SYSTEM_BUNDLE = ['Formatter', 'Logger', 'Modules'];

            ModulesRegistry.init();

            GlobalConfig.update({
                modules: [{
                    basePath: Env.BASE_PATH,

                    cache: true,

                    minify: false,

                    timeout: 5
                }, SYSTEM_CONFIG],

                interceptors: [
                    getInternal('PluginInterceptor'),
                    getInternal('PartialModuleInterceptor')
                ],

                globalAccess: false,

                loaderContext: 'default'
            });

            ModulesRegistry.register(SYSTEM_NAME, SYSTEM_BUNDLE).$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough

                /**
                 * @global
                 * @module System
                 * @see JARS.internals.System
                 */
                return System;
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
