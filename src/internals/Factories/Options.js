JARS.internal('Factories/Options', function(getInternal) {
    'use strict';

    var ConfigOptions = getInternal('Configs/Options');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Configs.Options}
     */
    function Options(injector) {
        var parentBundleName = injector.get('parentBundleName');

        return parentBundleName ? ConfigOptions.childOf(injector.inject(parentBundleName, 'options')) : new ConfigOptions();
    }

    return Options;
});
