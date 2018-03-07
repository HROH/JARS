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
        subject: function(injectLocal) {
            return new SubjectDependencies(injectLocal('requestor'), injectLocal('state'), injectLocal('strategy'));
        }
    };

    return Dependencies;
});
