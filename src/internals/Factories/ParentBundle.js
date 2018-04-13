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
        var parentBundleName = injector.get('parentBundleName');

        return parentBundleName ? injector.inject(parentBundleName, 'subject') : null;
    }

    return ParentBundle;
});
