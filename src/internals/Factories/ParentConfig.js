JARS.internal('Factories/ParentConfig', function(getInternal) {
    'use strict';

    var BundleResolver = getInternal('Resolvers/Bundle'),
        ParentResolver = getInternal('Resolvers/Parent'),
        ParentConfig;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    ParentConfig = {
        module: [getBundleConfig],

        bundle: [function(subjectName, injected) {
            return subjectName === BundleResolver.ROOT ? null : getBundleConfig(ParentResolver(BundleResolver.removeBundleSuffix(subjectName)), injected);
        }],

        interception: [function(subject, injected) {
            return injected.requestor.config;
        }, ['requestor']]
    };

    /**
     * @memberof JARS~internals.Factories.ParentConfig
     * @inner
     *
     * @param {string} subjectName
     * @param {Object} injected
     *
     * @return {JARS~internals.Configs.Subject}
     */
    function getBundleConfig(subjectName, injected) {
        return injected.$inject(BundleResolver.getBundleName(subjectName), 'config');
    }

    return ParentConfig;
});
