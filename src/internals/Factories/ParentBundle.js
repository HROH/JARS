JARS.internal('Factories/ParentBundle', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {(JARS~internals.Subjects.Subject|null)}
     */
    function ParentBundle(injector) {
        return injector.inject(injector.get('parentBundleName'), 'subject');
    }

    return ParentBundle;
});
