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
            rootModule.$export();
        }
    };

    return Modules;
});
