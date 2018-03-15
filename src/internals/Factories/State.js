JARS.internal('Factories/State', function(getInternal) {
    'use strict';

    var SubjectState = getInternal('States/Subject');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.States.Subject}
     */
    function State(injector) {
        return new SubjectState(injector.subjectName);
    }

    return State;
});
