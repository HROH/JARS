JARS.internal('Factories/State', function(getInternal) {
    'use strict';

    var SubjectState = getInternal('States/Subject'),
        State;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    State = {
        subject: [function(subjectName, injected) {
            return new SubjectState(injected.baseSubject);
        }, ['baseSubject']]
    };

    return State;
});
