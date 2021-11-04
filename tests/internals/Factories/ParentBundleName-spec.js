JARS.module('tests.internals.Factories.ParentBundleName').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        FactoryHelper = this;

    describe('Factories/ParentBundleName', function() {
        var ParentBundleNameFactory = InternalsRegistry.get('Factories/ParentBundleName');

        it('should return the bundle when given a module injector', function() {
            expect(ParentBundleNameFactory(FactoryHelper.createModuleInjector())).to.equal('test.*');
        });

        it('should return the bundle when given a bundle injector', function() {
            expect(ParentBundleNameFactory(FactoryHelper.createBundleInjector())).to.equal(SubjectsRegistry.getRootBundle().name);
        });

        it('should return the bundle when given an interception injector', function() {
            expect(ParentBundleNameFactory(FactoryHelper.createInterceptionInjector())).to.equal('test.*');
        });

        it('should return an empty string when given the root bundle injector', function() {
            expect(ParentBundleNameFactory(FactoryHelper.createRootBundleInjector())).to.equal('');
        });
    });
});
