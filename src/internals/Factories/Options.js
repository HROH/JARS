JARS.internal('Factories/Options', function(getInternal) {
    'use strict';

    var ConfigOptions = getInternal('Configs/Options'),
        getModuleParentName = getInternal('Resolvers/Subjects/Module').getParentName,
        getBundleName = getInternal('Resolvers/Subjects/Bundle').getName,
        optionFactories;

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Configs.Options}
     */
    function Options(injector) {
        return optionFactories[injector.type](injector);
    }

    optionFactories = {
        module: function(injector) {
            return inheritOptions(injector, getBundleName(injector.subjectName));
        },

        bundle: function(injector) {
            var grandParentName = getModuleParentName(injector.get('parentName'));

            return grandParentName ? inheritOptions(injector, getBundleName(grandParentName)) : new ConfigOptions();
        },

        interception: function(injector) {
            return inheritOptions(injector, injector.requestorName);
        }
    };

    /**
     * @memberof JARS~internals.Factories.Options
     * @inner
     *
     * @param {JARS~internals.Helpers.Injector} injector
     * @param {string} subjectName
     *
     * @return {JARS~internals.Configs.Options}
     */
    function inheritOptions(injector, subjectName) {
        return ConfigOptions.childOf(injector.inject(subjectName, 'options'));
    }

    return Options;
});
