JARS.internal('Factories/ParentName', function(getInternal) {
    'use strict';

    var SubjectResolvers = getInternal('Resolvers/Subjects');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {string}
     */
    function ParentName(injector) {
        return SubjectResolvers[injector.type].getParentName(injector.subjectName);
    }

    return ParentName;
});
