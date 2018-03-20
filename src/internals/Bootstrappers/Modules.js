JARS.internal('Bootstrappers/Modules', function(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Bootstrappers
     */
    var Modules = {
        /**
         * @method
         */
        bootstrap: function() {
            var rootModule = getInternal('Registries/Subjects').getRootModule();
            
            getInternal('Helpers/Tracker').setRoot(rootModule);
            rootModule.setMeta({
                /**
                 * @param {JARS~internals.Subjects.Interception} pluginRequest
                 */
                plugIn: function(pluginRequest, getInternal) {
                    var internalName = pluginRequest.info.data,
                        internal = getInternal(internalName);

                    if(internal) {
                        pluginRequest.logger.warn('You are accessing the internal "${0}". They might be subject to change!', [internalName]);
                        pluginRequest.$export(function() {
                            return internal;
                        });
                    }
                    else {
                        pluginRequest.stateUpdater.setAborted('could not find internal "${0}"!', [internalName]);
                    }
                }
            });
            rootModule.$export();
        }
    };

    return Modules;
});
