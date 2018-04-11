JARS.internal('Factories/Ref', function(getInternal) {
    'use strict';

    var SubjectRef = getInternal('Refs/Subject');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Refs.Subject}
     */
    function Ref(injector) {
        return new SubjectRef(injector.subjectName, injector.inject(injector.get('parentName'), 'ref'), injector.get('config'));
    }

    return Ref;
});
