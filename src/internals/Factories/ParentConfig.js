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
        module: function(injectLocal, inject) {
            return injectBundleConfig(inject, injectLocal('$name'));
        },

        bundle: function(injectLocal, inject) {
            var bundleName = injectLocal('$name');
            
            return bundleName === BundleResolver.ROOT ? null : injectBundleConfig(inject, ParentResolver(BundleResolver.removeBundleSuffix(bundleName)));
        },

        interception: function(injectLocal) {
            return injectLocal('requestor').config;
        }
    };

    /**
     * @memberof JARS~internals.Factories.ParentConfig
     * @inner
     *
     * @param {function} inject
     * @param {string} subjectName
     *
     * @return {JARS~internals.Configs.Subject}
     */
    function injectBundleConfig(inject, subjectName) {
        return inject(BundleResolver.getBundleName(subjectName), 'config');
    }

    return ParentConfig;
});
