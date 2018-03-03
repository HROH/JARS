JARS.internal('Factories/Requestor', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    var Requestor = {
        subject: [function(subjectName, injected) {
            return injected.baseSubject;
        }, ['baseSubject']],

        interception: [function(subjectName, injected) {
            return injected.$arg;
        }],
    };

    return Requestor;
});
