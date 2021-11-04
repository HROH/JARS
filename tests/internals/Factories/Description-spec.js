JARS.module('tests.internals.Factories.Description').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        FactoryHelper = this;

    describe('Factories/Description()', function() {
        var DescriptionFactory = InternalsRegistry.get('Factories/Description');

        it('should return a module descriptor for a module', function() {
            expect(DescriptionFactory(FactoryHelper.createModuleInjector())).to.equal('Module:');
        });

        it('should return a bundle descriptor for a bundle', function() {
            expect(DescriptionFactory(FactoryHelper.createBundleInjector())).to.equal('Bundle:');
        });

        it('should return a interception descriptor for an interception', function() {
            expect(DescriptionFactory(FactoryHelper.createInterceptionInjector())).to.equal('Interception:');
        });
    });
});
