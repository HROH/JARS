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
        module: function(injectLocal, inject) {
            var moduleName = injectLocal('$name');

            return moduleName === ParentResolver.ROOT ? null : injectSubject(inject, ParentResolver(moduleName));
        },

        bundle: function(injectLocal, inject) {
            return injectSubject(inject, BundleResolver.removeBundleSuffix(injectLocal('$name')));
        },

        interception: function(injectLocal, inject) {
            return injectSubject(inject, InterceptionResolver.removeInterceptionData(injectLocal('$name')), injectLocal('requestor'));
        },
    };

    /**
     * @memberof JARS~internals.Factories.Parent
     *
     * @param {function} inject
     * @param {string} subjectName
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function injectSubject(inject, subjectName, requestor) {
        return inject(subjectName, 'subject', requestor);
    }

    return Parent;
});
