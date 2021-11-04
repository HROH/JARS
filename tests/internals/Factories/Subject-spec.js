JARS.module('tests.internals.Factories.Subject').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Subject = InternalsRegistry.get('Subjects/Subject'),
        FactoryHelper = this;

    describe('Factories/Subject', function() {
        var SubjectFactory = InternalsRegistry.get('Factories/Subject');

        it('should return an instance of `Subjects/Subject` when given a module injector', function() {
            expect(SubjectFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given a bundle injector', function() {
            expect(SubjectFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given an interception injector', function() {
            expect(SubjectFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Subject);
        });
    });
});
