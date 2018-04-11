JARS.internal('Factories/Subject', function(getInternal) {
    'use strict';

    var BaseSubject = getInternal('Subjects/Subject');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function Subject(injector) {
        var subjectName = injector.subjectName;

        return new BaseSubject(subjectName, injectParent(injector), injectRequestor(injector), injector);
    }

    /**
     * @memberof JARS~internals.Factories.Subject
     * @inner
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function injectParent(injector) {
        return injector.inject(injector.get('parentName'), 'subject');
    }

    /**
     * @memberof JARS~internals.Factories.Subject
     * @inner
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {(JARS~internals.Subjects.Subject|null)}
     */
    function injectRequestor(injector) {
        return injector.subjectName !== injector.requestorName ? injector.inject(injector.requestorName, 'subject') : null;
    }

    return Subject;
});
