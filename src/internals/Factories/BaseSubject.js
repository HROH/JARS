JARS.internal('Factories/BaseSubject', function(getInternal) {
    'use strict';

    var Subject = getInternal('Subjects/Subject'),
        BaseSubject;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    BaseSubject = {
        subject: [function(subjectName) {
            return new Subject(subjectName);
        }]
    };

    return BaseSubject;
});
