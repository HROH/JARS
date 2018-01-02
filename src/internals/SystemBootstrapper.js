JARS.internal('SystemBootstrapper', function(getInternal) {
    'use strict';

    var System = getInternal('System'),
        SystemBootstrapper;

    SystemBootstrapper= {
        bootstrap: function() {
            var systemModule;

            getInternal('GlobalConfig').update('modules', {
                restrict: 'System.*',

                basePath: getInternal('Env').INTERNALS_PATH
            });

            systemModule = getInternal('ModulesRegistry').register('System', [
                'Formatter',
                'Logger',
                'LogContext',
                'LogLevels',
                'Modules',
                'Transports.*'
            ]);

            systemModule.setMeta({
                /**
                 * @param {JARS.internals.Interception} pluginRequest
                 */
                plugIn: function(pluginRequest) {
                    pluginRequest.success(pluginRequest.requestor.config.get('config'));
                }
            });

            systemModule.$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough

                /**
                 * @global
                 * @module System
                 * @see JARS.internals.System
                 */
                return System;
            });

            return systemModule;
        }
    };

    return SystemBootstrapper;
});
