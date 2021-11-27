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
            var rootModule = getInternal('Registries/Subjects').getRootModule();

            getInternal('Helpers/Tracker').setRoot(rootModule);
            rootModule.setMeta({
                /**
                 * @param {JARS~internals.Subjects.Subject} interception
                 */
                plugIn: function(interception) {
                    var internalName = interception.info.data,
                        internal = getInternal(internalName);

                    if(internal) {
                        interception.requestor.logger.warn(MSG_INTERNAL_ACCESSED, [internalName]);
                        interception.$export(function() {
                            return internal;
                        });
                    }
                    else {
                        interception.abort(MSG_INTERNAL_NOT_FOUND, [internalName]);
                    }
                }
            });
            rootModule.$export();
        }
    };

    return Modules;
});
