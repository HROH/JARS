JARS.internal('Factories/Dependencies', function(getInternal) {
    'use strict';

    var SubjectDependencies = getInternal('Subjects/Dependencies');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     * @param {JARS~internals.Subjects.Subject} requestor
     *
     * @return {JARS~internals.Subjects.Dependencies}
     */
    function Dependencies(injector, requestor) {
        return new SubjectDependencies(requestor, injector.get('state'), injector.get('strategy'));
    }

    return Dependencies;
});
