JARS.internal('Bootstrappers/System', function(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Bootstrappers
     */
    var System = {
        /**
         * @method
         */
        bootstrap: function() {
            var systemModule;

            getInternal('Configs/Global').update('modules', {
                restrict: 'System.*',

                basePath: getInternal('Env').INTERNALS_PATH
            });

            systemModule = getInternal('Registries/Modules').register('System', [
                'Formatter',
                'Logger',
                'LogContext',
                'LogLevels',
                'Modules',
                'Transports.*'
            ]);

            systemModule.setMeta({
                /**
                 * @param {JARS~internals.Subjects.Interception} pluginRequest
                 */
                plugIn: function(pluginRequest) {
                    pluginRequest.success(pluginRequest.requestor.config.get('config'));
                }
            });

            systemModule.$export(function() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough

                /**
                 * @global
                 * @module System
                 * @see JARS~internals.System
                 */
                return getInternal('System');
            });
        }
    };

    return System;
});
