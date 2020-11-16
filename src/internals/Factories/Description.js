JARS.internal('Factories/Description', function() {
    'use strict';

    var DESCRIPTIONS = {
        module: 'Module:',

        bundle: 'Bundle:',

        interception: 'Interception:'
    };

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {string}
     */
    function Description(injector) {
        return DESCRIPTIONS[injector.type];
    }

    return Description;
});
