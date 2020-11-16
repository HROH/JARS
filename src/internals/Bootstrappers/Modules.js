JARS.internal('Bootstrappers/Modules', function(getInternal) {
    'use strict';

    var MSG_INTERNAL_ACCESSED = 'You are accessing the internal "${0}". They might be subject to change!',
        MSG_INTERNAL_NOT_FOUND = 'could not find internal "${0}"!',
        Modules;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Bootstrappers
     */
    Modules = {
        /**
         * @method
         */
        bootstrap: function() {
            var rootModule = getInternal('Registries/Injector').getRootModule();

            getInternal('Helpers/Tracker').setRoot(rootModule);
            rootModule.setMeta({
                /**
                 * @param {JARS~internals.Subjects.Subject} pluginRequest
                 */
                plugIn: function(pluginRequest) {
                    var internalName = pluginRequest.info.data,
                        internal = getInternal(internalName);

                    if(internal) {
                        pluginRequest.requestor.logger.warn(MSG_INTERNAL_ACCESSED, [internalName]);
                        pluginRequest.$export(function() {
                            return internal;
                        });
                    }
                    else {
                        pluginRequest.abort(MSG_INTERNAL_NOT_FOUND, [internalName]);
                    }
                }
            });
            rootModule.$export();
        }
    };

    return Modules;
});
