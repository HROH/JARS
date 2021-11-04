JARS.module('tests.internals.Factories.ParentBundle').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        Injector = InternalsRegistry.get('Registries/Injector'),
        FactoryHelper = this;

    describe('Factories/ParentBundle', function() {
        var ParentBundleFactory = InternalsRegistry.get('Factories/ParentBundle');

        it('should return the parent bundle for a module', function() {
            expect(ParentBundleFactory(FactoryHelper.createModuleInjector())).to.equal(SubjectsRegistry.getSubject('test.*'));
            expect(ParentBundleFactory(FactoryHelper.createRootModuleInjector())).to.equal(SubjectsRegistry.getRootBundle());
        });

        it('should return the parent bundle for a bundle', function() {
            expect(ParentBundleFactory(new Injector(SubjectsRegistry, 'test.deep.*', 'test-requestor'))).to.equal(SubjectsRegistry.getSubject('test.*'));
            expect(ParentBundleFactory(FactoryHelper.createBundleInjector())).to.equal(SubjectsRegistry.getRootBundle());
        });

        it('should return the parent bundle for an interception', function() {
            expect(ParentBundleFactory(FactoryHelper.createInterceptionInjector())).to.equal(SubjectsRegistry.getSubject('test.*'));
            expect(ParentBundleFactory(new Injector(SubjectsRegistry, 'test.*!', 'test-requestor'))).to.equal(SubjectsRegistry.getSubject('test.*'));
        });

        it('should return `null` for the root bundle', function() {
            expect(ParentBundleFactory(FactoryHelper.createRootBundleInjector())).to.equal(null);
        });
    });
});
