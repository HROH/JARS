JARS.internal('Factories/Subject', function(getInternal) {
    'use strict';

    var merge = getInternal('Helpers/Object').merge,
        Subject;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Subject = {
        subject: [function(subjectName, injected) {
            var subject = injected.baseSubject;

            merge(subject, injected);
            delete subject.baseSubject;

            return subject;
        }, ['baseSubject', 'logger', 'state', 'dependencies', 'config', 'ref', 'parent', 'requestor', 'handler', 'info']]
    };

    return Subject;
});
