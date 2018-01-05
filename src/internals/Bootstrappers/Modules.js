JARS.internal('Bootstrappers/Modules', function(getInternal) {
    'use strict';

    var ModulesBootstrapper = {
        bootstrap: function() {
            var ModulesRegistry = getInternal('Registries/Modules');

            ModulesRegistry.Module = getInternal('Module');
            ModulesRegistry.getRoot().$export();
        }
    };

    return ModulesBootstrapper;
});
