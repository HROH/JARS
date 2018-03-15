JARS.internal('Factories/Dependencies', function(getInternal) {
    'use strict';

    var SubjectDependencies = getInternal('Subjects/Dependencies');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     * @param {JARS~internals.Subjects.Subject} requestor
     *
     * @return {JARS~internals.Subjects.Dependencies}
     */
    function Dependencies(injector, requestor) {
        return new SubjectDependencies(requestor, injector.injectLocal('state'), injector.injectLocal('strategy'));
    }

    return Dependencies;
});
