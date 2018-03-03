JARS.internal('Factories/Dependencies', function(getInternal) {
    'use strict';

    var SubjectDependencies = getInternal('Subjects/Dependencies'),
        Dependencies;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Dependencies = {
        subject: [function(subjectName, injected) {
            return new SubjectDependencies(injected.requestor, injected.state, injected.resolutionStrategy);
        }, ['requestor', 'state', 'resolutionStrategy']]
    };

    return Dependencies;
});
