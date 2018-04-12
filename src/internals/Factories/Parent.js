JARS.internal('Factories/Parent', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function Parent(injector) {
        return injector.inject(injector.get('parentName'), 'subject');
    }

    return Parent;
});
