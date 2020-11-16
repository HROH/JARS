JARS.internal('Factories/State', function(getInternal) {
    'use strict';

    var SubjectState = getInternal('State/Subject');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {JARS~internals.State.Subject}
     */
    function State(injector) {
        return new SubjectState(injector.subjectName);
    }

    return State;
});
