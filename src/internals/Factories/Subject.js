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
        return new BaseSubject(injector.subjectName, injector);
    }

    return Subject;
});
