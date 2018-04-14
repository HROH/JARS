JARS.internal('Handlers/Subjects/Parent', function(getInternal) {
    'use strict';

    var SubjectHandler = getInternal('Handlers/Subjects/Subject'),
        MSG_STRINGS = ['parent'];

    /**
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Handlers.Completion~Subject} completionHandler
     *
     * @return {JARS~internals.Handlers.Subjects.Subject}
     */
    function Parent(subject, completionHandler) {
        return new SubjectHandler(subject, [subject.parent], MSG_STRINGS, completionHandler);
    }

    return Parent;
});
