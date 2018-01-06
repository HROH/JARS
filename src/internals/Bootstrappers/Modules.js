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
            var ModulesRegistry = getInternal('Registries/Modules');

            ModulesRegistry.Module = getInternal('Module');
            ModulesRegistry.getRoot().$export();
        }
    };

    return Modules;
});
