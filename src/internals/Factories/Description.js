JARS.internal('Factories/Description', function() {
    'use strict';

    var DESC_MODULE = 'Module:',
        DESC_BUNDLE = 'Bundle:',
        DESC_INTERCEPTION = 'Interception:',
        Description;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Description = {
        module: function(injectLocal) {
            return DESC_MODULE + injectLocal('$name');
        },

        bundle: function(injectLocal) {
            return DESC_BUNDLE + injectLocal('$name');
        },

        interception: function(injectLocal) {
            return DESC_INTERCEPTION + injectLocal('$name');
        },
    };

    return Description;
});
