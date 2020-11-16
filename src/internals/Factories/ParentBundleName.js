JARS.internal('Factories/ParentBundleName', function(getInternal) {
    'use strict';

    var getModuleParentName = getInternal('Resolvers/Subjects/Module').getParentName,
        getBundleName = getInternal('Resolvers/Subjects/Bundle').getName,
        SubjectName;

    SubjectName = {
        module: function(injector) {
            return injector.subjectName;
        },

        bundle: function(injector) {
            return getModuleParentName(injector.get('parentName'));
        },

        interception: function(injector) {
            return injector.get('parentName');
        }
    };

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {string}
     */
    function ParentBundleName(injector) {
        return getBundleName(SubjectName[injector.type](injector));
    }

    return ParentBundleName;
});
