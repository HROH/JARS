JARS.module('tests.internals.Factories.Parent').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Subject = InternalsRegistry.get('Subjects/Subject'),
        FactoryHelper = this;

    describe('Factories/Parent', function() {
        var ParentFactory = InternalsRegistry.get('Factories/Parent');

        it('should return an instance of `Subjects/Subject` when given a module injector', function() {
            expect(ParentFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given a bundle injector', function() {
            expect(ParentFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given an interception injector', function() {
            expect(ParentFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Subject);
        });

        it('should return `null` when given the root module injector', function() {
            expect(ParentFactory(FactoryHelper.createRootModuleInjector())).to.equal(null);
        });
    });
});
