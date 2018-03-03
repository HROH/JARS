JARS.internal('Factories/Parent', function(getInternal) {
    'use strict';

    var ParentResolver = getInternal('Resolvers/Parent'),
        BundleResolver = getInternal('Resolvers/Bundle'),
        InterceptionResolver = getInternal('Resolvers/Interception'),
        Parent;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Parent = {
        module: [function(subjectName, injected) {
            return subjectName === ParentResolver.ROOT ? null : getSubject(ParentResolver(subjectName), injected);
        }],

        bundle: [function(subjectName, injected) {
            return getSubject(BundleResolver.removeBundleSuffix(subjectName), injected);
        }],

        interception: [function(subjectName, injected) {
            return getSubject(InterceptionResolver.removeInterceptionData(subjectName), injected, injected.requestor);
        }, ['requestor']],
    };

    /**
     * @memberof JARS~internals.Factories.Parent
     *
     * @param {string} subjectName
     * @param {Object} injected
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function getSubject(subjectName, injected, requestor) {
        return injected.$inject(subjectName, 'subject', requestor);
    }

    return Parent;
});
