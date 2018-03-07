JARS.internal('Factories/Handler', function(getInternal) {
    'use strict';

    var ModuleHandler = getInternal('Handlers/Subjects/Module'),
        BundleHandler = getInternal('Handlers/Subjects/Bundle'),
        InterceptionHandler = getInternal('Handlers/Subjects/Interception'),
        Handler;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Handler = {
        module: function() {
            return ModuleHandler;
        },

        bundle: function() {
            return BundleHandler;
        },

        interception: function() {
            return InterceptionHandler;
        }
    };

    return Handler;
});
