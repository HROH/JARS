JARS.internal('Factories/Ref', function(getInternal) {
    'use strict';

    var SubjectRef = getInternal('Refs/Subject'),
        Ref;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Ref = {
        subject: [function(subjectName, injected) {
            return new SubjectRef(injected.baseSubject);
        }, ['baseSubject']]
    };

    return Ref;
});
