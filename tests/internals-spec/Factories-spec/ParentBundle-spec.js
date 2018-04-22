JARS.module('internals-spec.Factories-spec.ParentBundle-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector'),
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects');

    describe('Factories/ParentBundle', function() {
        var ParentBundleFactory = InternalsRegistry.get('Factories/ParentBundle');

        it('should return the parent bundle for a module', function() {
            expect(ParentBundleFactory(new Injector('test', 'test-requestor'))).to.equal(SubjectsRegistry.get('test.*'));
            expect(ParentBundleFactory(new Injector(SubjectsRegistry.getRootModule().name, 'test-requestor'))).to.equal(SubjectsRegistry.getRootBundle());
        });

        it('should return the parent bundle for a bundle', function() {
            expect(ParentBundleFactory(new Injector('test.deep.*', 'test-requestor'))).to.equal(SubjectsRegistry.get('test.*'));
            expect(ParentBundleFactory(new Injector('test.*', 'test-requestor'))).to.equal(SubjectsRegistry.getRootBundle());
        });

        it('should return the parent bundle for an interception', function() {
            expect(ParentBundleFactory(new Injector('test!', 'test-requestor'))).to.equal(SubjectsRegistry.get('test.*'));
            expect(ParentBundleFactory(new Injector('test.*!', 'test-requestor'))).to.equal(SubjectsRegistry.get('test.*'));
        });

        it('should return `null` for the root bundle', function() {
            expect(ParentBundleFactory(new Injector(SubjectsRegistry.getRootBundle().name, 'test-requestor'))).to.equal(null);
        });
    });
});
