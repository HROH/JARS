JARS.internal('Factories/Requestor', function() {
    'use strict';

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {(JARS~internals.Subjects.Subject|null)}
     */
    function Requestor(injector) {
        return injector.subjectName !== injector.requestorName ? injector.getGlobal(injector.requestorName, 'subject') : null;
    }

    return Requestor;
});
