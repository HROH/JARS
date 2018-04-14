JARS.internal('Handlers/Subjects/Dependencies', function(getInternal) {
    'use strict';

    var SubjectHandler = getInternal('Handlers/Subjects/Subject'),
        DependenciesCompletionHandler = getInternal('Handlers/Completion/Dependencies'),
        MSG_STRINGS = ['dependency', 'dependencies'];

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject~Provide} provide
     */
    function Dependencies(subject, provide) {
        return new SubjectHandler(subject, subject.dependencies.getNotCircular(), MSG_STRINGS, new DependenciesCompletionHandler(subject, provide));
    }

    return Dependencies;
});
