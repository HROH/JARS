JARS.internal('Handlers/Subjects/Parent', function(getInternal) {
    'use strict';

    var SubjectHandler = getInternal('Handlers/Subjects/Subject'),
        MSG_STRINGS = ['parent'];

    /**
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Handlers.Subjects.Module|JARS~internals.Handlers.Subjects.Bundle|JARS~internals.Handlers.Subjects.Interception} subjectHandler
     *
     * @return {JARS~internals.Handlers.Subjects.Subject}
     */
    function Parent(subject, subjectHandler) {
        return new SubjectHandler(subject, [subject.parent], MSG_STRINGS, function() {
            subjectHandler(subject);
        });
    }

    return Parent;
});
