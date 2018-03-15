JARS.internal('Factories/ParentName', function(getInternal) {
    'use strict';

    var parentFactories = {
        module: getInternal('Resolvers/Parent'),

        bundle: getInternal('Resolvers/Bundle').removeBundleSuffix,

        interception: getInternal('Resolvers/Interception').getSubjectName
    };

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {string}
     */
    function ParentName(injector) {
        return parentFactories[injector.type](injector.subjectName);
    }

    return ParentName;
});
