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
        subject: function(injectLocal) {
            return new SubjectRef(injectLocal('baseSubject'));
        }
    };

    return Ref;
});
