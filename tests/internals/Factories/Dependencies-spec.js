JARS.module('tests.internals.Factories.Dependencies').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Dependencies = InternalsRegistry.get('Subjects/Dependencies'),
        FactoryHelper = this;

    describe('Factories/Dependencies', function() {
        var DependenciesFactory = InternalsRegistry.get('Factories/Dependencies');

        it('should return an instance of `Subjects/Dependencies` when given a module injector', function() {
            expect(DependenciesFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Dependencies);
        });

        it('should return an instance of `Subjects/Dependencies` when given a bundle injector', function() {
            expect(DependenciesFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Dependencies);
        });

        it('should return an instance of `Subjects/Dependencies` when given an interception injector', function() {
            expect(DependenciesFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Dependencies);
        });
    });
});
