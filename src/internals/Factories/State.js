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
        subject: function(injectLocal) {
            return new SubjectState(injectLocal('baseSubject'));
        }
    };

    return State;
});
