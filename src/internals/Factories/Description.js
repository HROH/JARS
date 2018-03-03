JARS.internal('Factories/Description', function() {
    'use strict';

    var DESC_MODULE = 'Module',
        DESC_BUNDLE = 'Bundle',
        DESC_INTERCEPTION = 'Interception',
        Description;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Description = {
        module: [function() {
            return DESC_MODULE;
        }],

        bundle: [function() {
            return DESC_BUNDLE;
        }],

        interception: [function() {
            return DESC_INTERCEPTION;
        }],
    };

    return Description;
});
