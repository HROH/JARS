JARS.module('tests.internals.Factories.ParentName').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        FactoryHelper = this;

    describe('Factories/ParentName', function() {
        var ParentNameFactory = InternalsRegistry.get('Factories/ParentName');

        it('should return the parent module name when given a module injector', function() {
            expect(ParentNameFactory(FactoryHelper.createModuleInjector())).to.equal(SubjectsRegistry.getRootModule().name);
        });

        it('should return the module name when given a bundle injector', function() {
            expect(ParentNameFactory(FactoryHelper.createBundleInjector())).to.equal('test');
        });

        it('should return the module name when given an interception injector', function() {
            expect(ParentNameFactory(FactoryHelper.createInterceptionInjector())).to.equal('test');
        });
    });
});
