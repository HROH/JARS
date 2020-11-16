JARS.internal('Factories/Parent', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function Parent(injector) {
        return injector.getGlobal(injector.get('parentName'), 'subject');
    }

    return Parent;
});
