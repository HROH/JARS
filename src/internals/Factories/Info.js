JARS.internal('Factories/Info', function(getInternal) {
    'use strict';

    var SubjectResolvers = getInternal('Resolvers/Subjects');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {JARS~internals.Resolvers.Subjects~Info}
     */
    function Info(injector) {
        return SubjectResolvers[injector.type].getInfo(injector.subjectName);
    }

    return Info;
});
